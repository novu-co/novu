import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@uiw/react-codemirror';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
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
import { GripVertical } from 'lucide-react';

const subjectKey = 'subject';

interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}

const TRANSFORMERS = [
  { label: 'Uppercase', value: 'upcase' },
  { label: 'Lowercase', value: 'downcase' },
  { label: 'Capitalize', value: 'capitalize' },
  { label: 'Strip HTML', value: 'strip_html' },
  { label: 'Strip Newlines', value: 'strip_newlines' },
  { label: 'Escape', value: 'escape' },
] as const;

const VariablePopover = ({ variable, onClose, onUpdate }: VariablePopoverProps) => {
  // Parse the variable to extract name, default value, and transformers
  const [variableName, defaultValue = '', initialTransformers = []] = useMemo(() => {
    const parts = variable.split('|').map((part) => part.trim());
    const [nameWithDefault, ...rest] = parts;

    // Handle default value
    const defaultMatch = nameWithDefault.match(/default:\s*([^}]+)/);
    const name = defaultMatch ? nameWithDefault.replace(/\s*\|\s*default:[^}]+/, '') : nameWithDefault;
    const defaultVal = defaultMatch ? defaultMatch[1].trim() : '';

    // Get all transformers
    const transforms = rest.filter((part) => TRANSFORMERS.some((t) => t.value === part.trim()));

    return [name, defaultVal, transforms];
  }, [variable]);

  const [name, setName] = useState(variableName);
  const [defaultVal, setDefaultVal] = useState(defaultValue);
  const [transformers, setTransformers] = useState<string[]>(initialTransformers);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingRef = useRef(false);

  // Debounced update function
  const debouncedUpdate = useCallback(
    (newName: string, newDefaultVal: string, newTransformers: string[]) => {
      if (isUpdatingRef.current) return;

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        try {
          isUpdatingRef.current = true;

          // Build the variable parts
          const parts = [newName.trim()];

          if (newDefaultVal) {
            parts.push(`default: ${newDefaultVal.trim()}`);
          }

          // Add transformers in order
          parts.push(...newTransformers);

          // Join with proper spacing
          const finalValue = parts.join(' | ');
          onUpdate(finalValue);
        } finally {
          isUpdatingRef.current = false;
        }
      }, 300);
    },
    [onUpdate]
  );

  // Update when values change
  useEffect(() => {
    debouncedUpdate(name, defaultVal, transformers);
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [name, defaultVal, transformers, debouncedUpdate]);

  const handleTransformerToggle = (value: string) => {
    setTransformers((current) => {
      if (current.includes(value)) {
        return current.filter((t) => t !== value);
      }
      return [...current, value];
    });
  };

  const moveTransformer = (from: number, to: number) => {
    setTransformers((current) => {
      const newTransformers = [...current];
      const [removed] = newTransformers.splice(from, 1);
      newTransformers.splice(to, 0, removed);
      return newTransformers;
    });
  };

  return (
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Edit Variable</h4>
          <p className="text-muted-foreground text-sm">Modify the variable name or add transformers.</p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Variable Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Default Value</label>
            <Input
              value={defaultVal}
              onChange={(e) => setDefaultVal(e.target.value)}
              className="h-8"
              placeholder="Enter default value..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Transformers</label>
            <div className="flex flex-col gap-2">
              {/* Selected transformers with drag handles */}
              {transformers.length > 0 && (
                <div className="flex flex-col gap-1 rounded-md border p-2">
                  {transformers.map((value, index) => {
                    const transformer = TRANSFORMERS.find((t) => t.value === value);
                    return (
                      <div
                        key={value}
                        className="bg-secondary hover:bg-secondary/80 group flex cursor-move items-center gap-2 rounded p-1"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          moveTransformer(fromIndex, index);
                        }}
                      >
                        <GripVertical className="text-muted-foreground/50 group-hover:text-muted-foreground h-4 w-4" />
                        <span className="flex-1">{transformer?.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/90 hover:text-destructive-foreground h-6 px-2"
                          onClick={() => handleTransformerToggle(value)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available transformers */}
              <div className="flex flex-wrap gap-2">
                {TRANSFORMERS.filter((t) => !transformers.includes(t.value)).map(({ label, value }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => handleTransformerToggle(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
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
  const viewRef = useRef<EditorView | null>(null);
  const fieldRef = useRef<any>(null);
  const isUpdatingRef = useRef(false);

  const handleVariableClick = useCallback((e: MouseEvent, view: EditorView) => {
    if (isUpdatingRef.current) return;

    const target = e.target as HTMLElement;
    const pill = target.closest('.cm-variable-pill');

    if (pill instanceof HTMLElement) {
      e.preventDefault();
      e.stopPropagation();

      const variable = pill.getAttribute('data-variable');
      const start = parseInt(pill.getAttribute('data-start') || '0');
      const end = parseInt(pill.getAttribute('data-end') || '0');

      if (variable) {
        console.log('Selected variable:', { variable, start, end });
        setSelectedVariable({ value: variable, from: start, to: end });
      }
    }
  }, []);

  const handleVariableUpdate = useCallback(
    (newValue: string) => {
      if (!selectedVariable || !viewRef.current || !fieldRef.current || isUpdatingRef.current) {
        console.log('Skipping update:', {
          selectedVariable,
          viewRef: !!viewRef.current,
          fieldRef: !!fieldRef.current,
          isUpdating: isUpdatingRef.current,
        });
        return;
      }

      try {
        isUpdatingRef.current = true;
        const { from, to } = selectedVariable;
        const view = viewRef.current;

        // Get the current content and ensure we're not duplicating
        const currentContent = view.state.doc.toString();
        const beforeContent = currentContent.slice(0, from);
        const afterContent = currentContent.slice(to);

        // Create the new variable text
        const newVariableText = `{{${newValue}}}`;

        // Create and dispatch the transaction
        const changes = {
          from,
          to,
          insert: newVariableText,
        };

        view.dispatch({
          changes,
          selection: { anchor: from + newVariableText.length },
        });

        // Get the updated content and trigger form update
        const updatedContent = view.state.doc.toString();
        fieldRef.current.onChange(updatedContent);

        // Update the selected variable with new bounds
        setSelectedVariable((prev) => (prev ? { ...prev, value: newValue, to: from + newVariableText.length } : null));
      } finally {
        isUpdatingRef.current = false;
      }
    },
    [selectedVariable]
  );

  // Plugin to find and decorate variables
  const createVariablePlugin = useCallback(() => {
    return ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
          this.decorations = this.createDecorations(view);
          viewRef.current = view;
        }

        update(update: any) {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = this.createDecorations(update.view);
          }
          if (update.view) {
            viewRef.current = update.view;
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

            // Add the main variable decoration
            decorations.push(
              Decoration.mark({
                class: `cm-variable-pill ${document.documentElement.classList.contains('dark') ? 'cm-dark' : ''}`,
                attributes: {
                  'data-variable': variableName,
                  'data-start': start.toString(),
                  'data-end': end.toString(),
                },
                inclusive: true,
              }).range(start, end)
            );

            // Add bracket decorations
            decorations.push(
              Decoration.mark({
                class: 'cm-bracket',
              }).range(start, start + 2)
            );
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
  }, []);

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
    [variables, handleVariableClick, createVariablePlugin]
  );

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => {
        // Store the field reference
        fieldRef.current = field;

        return (
          <>
            <FormItem className="w-full">
              <FormControl>
                <div className="relative">
                  <Editor
                    size="lg"
                    autoFocus={!field.value}
                    fontFamily="inherit"
                    placeholder={capitalize(field.name)}
                    id={field.name}
                    extensions={extensions}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  />
                  <Popover
                    open={!!selectedVariable}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedVariable(null);
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
              </FormControl>
              <FormMessage />
            </FormItem>
          </>
        );
      }}
    />
  );
};
