import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@uiw/react-codemirror';
import { useMemo, useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';

const subjectKey = 'subject';

interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}

const VariablePopover = ({ variable, onClose, onUpdate }: VariablePopoverProps) => {
  const [value, setValue] = useState(variable);

  return (
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Edit Variable</h4>
          <p className="text-muted-foreground text-sm">Modify the variable name or select from available options.</p>
        </div>
        <div className="grid gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-8" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onUpdate(value);
                onClose();
              }}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  );
};

// Create a decoration for variable pills
const variablePillTheme = EditorView.baseTheme({
  '.cm-variable-pill': {
    backgroundColor: 'rgb(255 255 255 / 0.5)',
    color: 'rgb(55, 65, 81)',
    border: '1px solid #e5e7eb',
    borderRadius: '9999px',
    padding: '2px 6px 2px 24px',
    margin: '0 2px',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    height: '24px',
    lineHeight: '24px',
    fontSize: '14px',
    cursor: 'pointer',
    position: 'relative',
  },
  '.cm-variable-pill::before': {
    content: '""',
    position: 'absolute',
    left: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '14px',
    height: '14px',
    backgroundColor: '#E11D48',
    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1'%3E%3C/path%3E%3Cpath d='M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1'%3E%3C/path%3E%3C/svg%3E")`,
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    maskSize: 'contain',
    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1'%3E%3C/path%3E%3Cpath d='M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1'%3E%3C/path%3E%3C/svg%3E")`,
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskSize: 'contain',
  },
  '.cm-variable-pill.cm-dark': {
    backgroundColor: '#FFD6EE',
    color: '#AD74FF',
    border: '1px solid #3D3D4D',
  },
  '.cm-variable-pill .cm-bracket': {
    display: 'none',
  },
});

export const EmailSubject = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);
  const [selectedVariable, setSelectedVariable] = useState<{ value: string; from: number; to: number } | null>(null);

  // Plugin to find and decorate variables
  const createVariablePlugin = () => {
    return ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
          this.decorations = this.createDecorations(view);
        }

        update(update: any) {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = this.createDecorations(update.view);
          }
        }

        createDecorations(view: EditorView) {
          const decorations: any[] = [];
          const content = view.state.doc.toString();
          const variableRegex = /{{(.*?)}}/g;
          let match;

          while ((match = variableRegex.exec(content)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            const variableName = match[1].trim();

            // Add bracket decoration for the opening {{
            decorations.push(
              Decoration.mark({
                class: 'cm-bracket',
              }).range(start, start + 2)
            );

            // Add the main variable decoration
            decorations.push(
              Decoration.mark({
                class: `cm-variable-pill ${document.documentElement.classList.contains('dark') ? 'cm-dark' : ''}`,
                attributes: {
                  'data-variable': variableName,
                  'data-start': start.toString(),
                  'data-end': end.toString(),
                },
              }).range(start, end)
            );

            // Add bracket decoration for the closing }}
            decorations.push(
              Decoration.mark({
                class: 'cm-bracket',
              }).range(end - 2, end)
            );
          }

          return Decoration.set(decorations, true);
        }
      },
      {
        decorations: (v) => v.decorations,
        provide: (plugin) =>
          EditorView.atomicRanges.of((view) => {
            return view.plugin(plugin)?.decorations || Decoration.none;
          }),
      }
    );
  };

  const handleVariableClick = (e: MouseEvent, view: EditorView) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('cm-variable-pill')) {
      const variable = target.getAttribute('data-variable');
      const start = parseInt(target.getAttribute('data-start') || '0');
      const end = parseInt(target.getAttribute('data-end') || '0');

      if (variable) {
        setSelectedVariable({ value: variable, from: start, to: end });
      }
    }
  };

  const handleVariableUpdate = (newValue: string) => {
    if (!selectedVariable) return;

    const { from, to } = selectedVariable;
    const view = editorRef.current?.view;
    if (!view) return;

    view.dispatch({
      changes: {
        from,
        to,
        insert: `{{${newValue}}}`,
      },
    });
  };

  const editorRef = useRef<any>(null);

  const extensions = useMemo(
    () => [
      autocompletion({ override: [completions(variables)] }),
      EditorView.lineWrapping,
      variablePillTheme,
      createVariablePlugin(),
      EditorView.domEventHandlers({
        click: handleVariableClick,
      }),
    ],
    [variables]
  );

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => (
        <>
          <FormItem className="w-full">
            <FormControl>
              <div className="relative">
                <Editor
                  ref={editorRef}
                  size="lg"
                  autoFocus={!field.value}
                  fontFamily="inherit"
                  placeholder={capitalize(field.name)}
                  id={field.name}
                  extensions={extensions}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                />
                <Popover open={!!selectedVariable} onOpenChange={(open) => !open && setSelectedVariable(null)}>
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
            </FormControl>
            <FormMessage />
          </FormItem>
        </>
      )}
    />
  );
};
