import { useMemo, useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PopoverContent } from '@/components/primitives/popover';
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

export const VariablePopover = ({ variable, onClose, onUpdate }: VariablePopoverProps) => {
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
