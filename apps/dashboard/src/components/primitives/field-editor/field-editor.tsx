import { EditorView } from '@uiw/react-codemirror';
import { useMemo, useState, useRef, useCallback } from 'react';
import { Completion, CompletionContext } from '@codemirror/autocomplete';

import { Editor } from '@/components/primitives/editor';
import { completions } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { autocompletion } from '@codemirror/autocomplete';
import { Popover, PopoverTrigger } from '@/components/primitives/popover';
import { VariablePopover } from './variable-popover';
import { createVariablePlugin } from './variable-plugin';
import { variablePillTheme } from './variable-theme';

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

export const FieldEditor = ({
  value,
  onChange,
  variables,
  placeholder,
  autoFocus,
  size = 'default',
  fontFamily = 'inherit',
  id,
}: FieldEditorProps) => {
  const [selectedVariable, setSelectedVariable] = useState<{ value: string; from: number; to: number } | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isUpdatingRef = useRef(false);
  const lastCompletionRef = useRef<{ from: number; to: number } | null>(null);

  const handleVariableClick = useCallback((e: MouseEvent) => {
    if (isUpdatingRef.current) return;

    const target = e.target as HTMLElement;
    const pill = target.closest('.cm-variable-pill');

    if (pill instanceof HTMLElement) {
      e.preventDefault();
      e.stopPropagation();

      const variable = pill.getAttribute('data-variable');
      const start = parseInt(pill.getAttribute('data-start') || '0');
      const end = parseInt(pill.getAttribute('data-end') || '0');

      if (variable && end) {
        requestAnimationFrame(() => {
          setSelectedVariable({ value: variable, from: start, to: end });
        });
      }
    }
  }, []);

  const handleVariableUpdate = useCallback(
    (newValue: string) => {
      if (!selectedVariable || !viewRef.current || isUpdatingRef.current) {
        return;
      }

      try {
        isUpdatingRef.current = true;
        const { from, to } = selectedVariable;
        const view = viewRef.current;

        const newVariableText = `{{${newValue}}}`;

        const changes = {
          from,
          to,
          insert: newVariableText,
        };

        view.dispatch({
          changes,
          selection: { anchor: from + newVariableText.length },
        });

        const updatedContent = view.state.doc.toString();

        onChange(updatedContent);

        setSelectedVariable((prev) => (prev ? { ...prev, value: newValue, to: from + newVariableText.length } : null));
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [selectedVariable, onChange]
  );

  const completionSource = useCallback(
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

          if (before !== '{{') {
            view.dispatch({
              changes: { from, to, insert: `{{${text}}} ` },
            });
          } else {
            view.dispatch({
              changes: { from, to, insert: `${text}}} ` },
            });
          }
        },
      };
    },
    [variables]
  );

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
      createVariablePlugin({ viewRef, lastCompletionRef }),
      EditorView.domEventHandlers({
        mousedown: handleVariableClick,
      }),
    ],
    [variables, handleVariableClick, completionSource]
  );

  return (
    <div className="relative">
      <div className="flex min-h-[80px] flex-col">
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
      </div>
      <Popover
        open={!!selectedVariable}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => {
              setSelectedVariable(null);
            }, 0);
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
};
