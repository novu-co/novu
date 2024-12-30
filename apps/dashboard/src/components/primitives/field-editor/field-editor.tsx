import { EditorView } from '@uiw/react-codemirror';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { autocompletion } from '@codemirror/autocomplete';

import { Editor } from '@/components/primitives/editor';
import { completions } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { Popover, PopoverTrigger } from '@/components/primitives/popover';
import { createVariablePlugin } from './variable-plugin';
import { VariablePopover } from './variable-popover';
import { variablePillTheme } from './variable-plugin/variable-theme';
import { useCallback, useMemo, useRef, useState, Dispatch, SetStateAction } from 'react';

type SelectedVariable = {
  value: string;
  from: number;
  to: number;
} | null;

type CompletionRange = {
  from: number;
  to: number;
} | null;

type FieldEditorProps = {
  value: string;
  onChange: (value: string) => void;
  variables: LiquidVariable[];
  placeholder?: string;
  autoFocus?: boolean;
  size?: 'default' | 'lg';
  fontFamily?: 'inherit';
  id?: string;
};

export function FieldEditor({
  value,
  onChange,
  variables,
  placeholder,
  autoFocus,
  size = 'default',
  fontFamily = 'inherit',
  id,
}: FieldEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const lastCompletionRef = useRef<CompletionRange>(null);

  const { selectedVariable, setSelectedVariable, handleVariableSelect, isUpdatingRef } = useVariableSelection();

  const handleVariableUpdate = useVariableUpdate(
    selectedVariable,
    viewRef,
    isUpdatingRef,
    onChange,
    setSelectedVariable
  );

  const completionSource = useCompletionSource(variables, lastCompletionRef);

  const extensions = useMemo(
    () => [
      autocompletion({
        override: [completionSource],
        closeOnBlur: false,
        defaultKeymap: true,
        activateOnTyping: true,
      }),
      EditorView.lineWrapping,
      variablePillTheme,
      createVariablePlugin({ viewRef, lastCompletionRef, onSelect: handleVariableSelect }),
    ],
    [variables, completionSource, handleVariableSelect]
  );

  return (
    <div className="relative">
      <Editor
        size={size}
        className="flex-1"
        autoFocus={autoFocus}
        fontFamily={fontFamily}
        placeholder={placeholder}
        id={id}
        extensions={extensions}
        value={value}
        onChange={onChange}
      />
      <Popover
        open={!!selectedVariable}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setSelectedVariable(null), 0);
          }
        }}
      >
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        {selectedVariable && (
          <VariablePopover
            variable={selectedVariable.value}
            onClose={() => setSelectedVariable(null)}
            onUpdate={handleVariableUpdate}
          />
        )}
      </Popover>
    </div>
  );
}

function useVariableSelection() {
  const [selectedVariable, setSelectedVariable] = useState<SelectedVariable>(null);
  const isUpdatingRef = useRef(false);

  const handleVariableSelect = useCallback((value: string, from: number, to: number) => {
    if (isUpdatingRef.current) return;
    requestAnimationFrame(() => {
      setSelectedVariable({ value, from, to });
    });
  }, []);

  return {
    selectedVariable,
    setSelectedVariable,
    handleVariableSelect,
    isUpdatingRef,
  };
}

function useVariableUpdate(
  selectedVariable: SelectedVariable,
  viewRef: React.RefObject<EditorView>,
  isUpdatingRef: React.MutableRefObject<boolean>,
  onChange: (value: string) => void,
  setSelectedVariable: Dispatch<SetStateAction<SelectedVariable>>
) {
  return useCallback(
    (newValue: string) => {
      if (!selectedVariable || !viewRef.current || isUpdatingRef.current) return;

      try {
        isUpdatingRef.current = true;
        const { from, to } = selectedVariable;
        const view = viewRef.current;

        const hasLiquidSyntax = newValue.match(/^\{\{.*\}\}$/);
        const newVariableText = hasLiquidSyntax ? newValue : `{{${newValue}}}`;

        const currentContent = view.state.doc.toString();
        const afterCursor = currentContent.slice(to).trim();
        const hasClosingBrackets = afterCursor.startsWith('}}');

        const changes = {
          from,
          to: hasClosingBrackets ? to + 2 : to,
          insert: newVariableText,
        };

        view.dispatch({
          changes,
          selection: { anchor: from + newVariableText.length },
        });

        onChange(view.state.doc.toString());

        setSelectedVariable((prev: SelectedVariable) =>
          prev ? { ...prev, value: newValue, to: from + newVariableText.length } : null
        );
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [selectedVariable, onChange, viewRef, isUpdatingRef, setSelectedVariable]
  );
}

function useCompletionSource(variables: LiquidVariable[], lastCompletionRef: React.MutableRefObject<CompletionRange>) {
  return useCallback(
    (context: CompletionContext) => {
      const word = context.matchBefore(/\{\{([^}]*)/);
      if (!word) return null;

      const options = completions(variables)(context);
      if (!options) return null;

      return {
        ...options,
        apply: (view: EditorView, completion: Completion, from: number, to: number) => {
          const text = completion.label;
          lastCompletionRef.current = { from, to };

          const content = view.state.doc.toString();
          const before = content.slice(Math.max(0, from - 2), from);
          const insert = before !== '{{' ? `{{${text}}} ` : `${text}}} `;

          view.dispatch({
            changes: { from, to, insert },
          });
        },
      };
    },
    [variables, lastCompletionRef]
  );
}
