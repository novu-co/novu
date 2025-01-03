import { autocompletion } from '@codemirror/autocomplete';
import { EditorView } from '@uiw/react-codemirror';

import { Editor } from '@/components/primitives/editor';
import { Popover, PopoverTrigger } from '@/components/primitives/popover';
import { createAutocompleteSource } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { useMemo, useRef } from 'react';
import { useVariables } from './hooks/use-variables';
import { createVariablePlugin } from './variable-plugin';
import { variablePillTheme } from './variable-plugin/variable-theme';
import { VariablePopover } from './variable-popover';

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
  id?: string;
  singleLine?: boolean;
  indentWithTab?: boolean;
};

export function FieldEditor({
  value,
  onChange,
  variables,
  placeholder,
  autoFocus,
  size = 'default',
  id,
  singleLine,
  indentWithTab,
}: FieldEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const lastCompletionRef = useRef<CompletionRange>(null);

  const { selectedVariable, setSelectedVariable, handleVariableSelect, handleVariableUpdate } = useVariables(
    viewRef,
    onChange
  );

  const completionSource = useMemo(() => createAutocompleteSource(variables), [variables]);

  const extensions = useMemo(
    () => [
      autocompletion({
        override: [completionSource],
        closeOnBlur: true,
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
        fontFamily="inherit"
        singleLine={singleLine}
        indentWithTab={indentWithTab}
        size={size}
        className="flex-1"
        autoFocus={autoFocus}
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
