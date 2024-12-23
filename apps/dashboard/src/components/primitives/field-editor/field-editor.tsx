import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@uiw/react-codemirror';
import { useMemo, useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { Completion, CompletionContext } from '@codemirror/autocomplete';
import { motion, AnimatePresence } from 'motion/react';

import { Editor } from '@/components/primitives/editor';
import { completions } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { autocompletion } from '@codemirror/autocomplete';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { GripVertical } from 'lucide-react';
import { FormControl, FormItem } from '@/components/primitives/form/form';

const TRANSFORMERS = [
  { label: 'Uppercase', value: 'upcase' },
  { label: 'Lowercase', value: 'downcase' },
  { label: 'Capitalize', value: 'capitalize' },
  { label: 'Strip HTML', value: 'strip_html' },
  { label: 'Strip Newlines', value: 'strip_newlines' },
  { label: 'Escape', value: 'escape' },
] as const;

interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}

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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

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
    <PopoverContent className="w-72">
      <div className="grid gap-1.5">
        <div className="grid gap-1">
          <FormItem>
            <FormControl>
              <div className="grid gap-0.5">
                <label className="text-muted-foreground text-xs font-medium">Variable name</label>
                <InputField size="fit">
                  <Input
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="h-7 text-sm"
                  />
                </InputField>
              </div>
            </FormControl>
          </FormItem>
          <FormItem>
            <FormControl>
              <div className="grid gap-0.5">
                <label className="text-muted-foreground text-xs font-medium">Default value</label>
                <InputField size="fit">
                  <Input
                    value={defaultVal}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDefaultVal(e.target.value)}
                    className="h-7 text-sm"
                  />
                </InputField>
              </div>
            </FormControl>
          </FormItem>
        </div>

        <div className="flex flex-col gap-1">
          {/* Selected transformers with drag handles */}
          {transformers.length > 0 && (
            <div className="flex flex-col gap-0.5 rounded-md border p-1">
              <AnimatePresence>
                {transformers.map((value, index) => {
                  const transformer = TRANSFORMERS.find((t) => t.value === value);
                  return (
                    <motion.div
                      key={value}
                      className="relative"
                      layout
                      transition={{
                        layout: { duration: 0.2, ease: 'easeOut' },
                      }}
                    >
                      {dragOverIndex === index && (
                        <motion.div
                          className="bg-primary absolute -top-[2px] left-0 right-0 h-[2px]"
                          layoutId="dropIndicator"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                      <motion.div
                        className={`bg-secondary hover:bg-secondary/80 group flex cursor-move items-center gap-1.5 rounded px-1.5 py-0.5 text-sm ${
                          draggingItem === index ? 'ring-primary opacity-50 ring-2 ring-offset-1' : ''
                        }`}
                        drag
                        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDragStart={() => setDraggingItem(index)}
                        onDragEnd={() => {
                          setDraggingItem(null);
                          setDragOverIndex(null);
                        }}
                        onDragOver={() => {
                          if (dragOverIndex !== index) {
                            setDragOverIndex(index);
                          }
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setDragOverIndex(null);
                          }
                        }}
                        onDrop={() => {
                          if (draggingItem !== null && draggingItem !== index) {
                            moveTransformer(draggingItem, index);
                          }
                          setDragOverIndex(null);
                          setDraggingItem(null);
                        }}
                        animate={draggingItem === index ? { scale: 1.02 } : { scale: 1 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.15 }}
                      >
                        <GripVertical className="text-muted-foreground/50 group-hover:text-muted-foreground h-3 w-3" />
                        <span className="flex-1">{transformer?.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-destructive/90 hover:text-destructive-foreground h-5 px-1.5"
                          onClick={() => handleTransformerToggle(value)}
                        >
                          ×
                        </Button>
                      </motion.div>
                      {dragOverIndex === index + 1 && (
                        <motion.div
                          className="bg-primary absolute -bottom-[2px] left-0 right-0 h-[2px]"
                          layoutId="dropIndicator"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Available transformers */}
          <div className="flex flex-wrap gap-1">
            {TRANSFORMERS.filter((t) => !transformers.includes(t.value)).map(({ label, value }) => (
              <Button
                key={value}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => handleTransformerToggle(value)}
              >
                {label}
              </Button>
            ))}
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
  size = 'lg',
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

      if (variable && start && end) {
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

        const currentContent = view.state.doc.toString();
        const beforeContent = currentContent.slice(0, from);
        const afterContent = currentContent.slice(to);

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

  const createVariablePlugin = useCallback(() => {
    return ViewPlugin.fromClass(
      class {
        decorations: DecorationSet;
        lastCursor: number = 0;

        constructor(view: EditorView) {
          this.decorations = this.createDecorations(view);
          viewRef.current = view;
        }

        update(update: any) {
          if (update.docChanged || update.viewportChanged || update.selectionSet) {
            this.lastCursor = update.state.selection.main.head;

            const content = update.state.doc.toString();
            const pos = update.state.selection.main.head;
            if (update.docChanged && content.slice(pos - 2, pos) === '}}') {
              const start = content.lastIndexOf('{{', pos);
              if (start !== -1) {
                const variableContent = content.slice(start + 2, pos - 2).trim();
                if (variableContent) {
                  this.lastCursor = -1;
                }
              }
            }

            this.decorations = this.createDecorations(update.view);
          }
          if (update.view) {
            viewRef.current = update.view;
          }
        }

        createDecorations(view: EditorView) {
          const decorations: any[] = [];
          const content = view.state.doc.toString();
          const variableRegex = /{{([^{}]+)}}/g;
          let match;

          while ((match = variableRegex.exec(content)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            const variableName = match[1].trim();

            const isJustCompleted =
              lastCompletionRef.current &&
              start === lastCompletionRef.current.from - 2 &&
              end === lastCompletionRef.current.to + 2;

            if (variableName && (this.lastCursor < start || this.lastCursor > end || isJustCompleted)) {
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
          }

          lastCompletionRef.current = null;

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
              changes: { from, to, insert: `{{${text}}}` },
            });
          } else {
            view.dispatch({
              changes: { from, to, insert: `${text}}}` },
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
      createVariablePlugin(),
      EditorView.domEventHandlers({
        mousedown: handleVariableClick,
      }),
    ],
    [variables, handleVariableClick, createVariablePlugin, completionSource]
  );

  return (
    <div className="relative">
      <Editor
        size={size}
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
