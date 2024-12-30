import { useMemo, useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PopoverContent } from '@/components/primitives/popover';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { GripVertical } from 'lucide-react';
import { FormControl, FormItem } from '@/components/primitives/form/form';
import { RiCloseLine, RiDeleteBin2Line } from 'react-icons/ri';
import { Code2 } from '../../icons/code-2';
import { Separator } from '../separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';

interface Transformer {
  label: string;
  value: string;
  hasParam?: boolean;
}

const TRANSFORMERS: Transformer[] = [
  { label: 'Uppercase', value: 'upcase' },
  { label: 'Lowercase', value: 'downcase' },
  { label: 'Capitalize', value: 'capitalize' },
  { label: 'Strip HTML', value: 'strip_html' },
  { label: 'Strip Newlines', value: 'strip_newlines' },
  { label: 'Escape', value: 'escape' },
  { label: 'Minus', value: 'minus', hasParam: true },
];

interface TransformerWithParam {
  value: string;
  param?: string;
}

interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}

export const VariablePopover = ({ variable, onClose, onUpdate }: VariablePopoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Parse the variable to extract name, default value, and transformers
  const { parsedName, parsedDefaultValue, parsedTransformers } = useMemo(() => {
    if (!variable) {
      return { parsedName: '', parsedDefaultValue: '', parsedTransformers: [] };
    }

    const parts = variable.split('|').map((part) => part.trim());
    const [nameWithDefault, ...rest] = parts;

    // Handle default value
    const defaultMatch = nameWithDefault?.match(/default:\s*([^}]+)/);
    const name = defaultMatch ? nameWithDefault.replace(/\s*\|\s*default:[^}]+/, '') : nameWithDefault || '';
    const defaultVal = defaultMatch ? defaultMatch[1].trim() : '';

    // Get all transformers with their parameters
    const transforms =
      rest?.reduce<TransformerWithParam[]>((acc, part) => {
        const [transformerValue, param] = part.split(':').map((p) => p.trim());
        if (TRANSFORMERS.some((t) => t.value === transformerValue)) {
          acc.push({ value: transformerValue, ...(param ? { param } : {}) });
        }
        return acc;
      }, []) || [];

    return {
      parsedName: name,
      parsedDefaultValue: defaultVal,
      parsedTransformers: transforms,
    };
  }, [variable]);

  const [name, setName] = useState(parsedName);
  const [defaultVal, setDefaultVal] = useState(parsedDefaultValue);
  const [transformers, setTransformers] = useState<TransformerWithParam[]>(parsedTransformers);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingRef = useRef(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  // Debounced update function
  const debouncedUpdate = useCallback(
    (newName: string, newDefaultVal: string, newTransformers: TransformerWithParam[]) => {
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

          // Add transformers in order with their parameters
          parts.push(...newTransformers.map((t) => (t.param ? `${t.value}: ${t.param}` : t.value)));

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
      if (current.some((t) => t.value === value)) {
        return current.filter((t) => t.value !== value);
      }
      return [...current, { value }];
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

  const handleParamChange = (index: number, param: string) => {
    setTransformers((current) => {
      const newTransformers = [...current];
      newTransformers[index] = { ...newTransformers[index], param };
      return newTransformers;
    });
  };

  return (
    <PopoverContent className="w-72 p-0">
      <div ref={containerRef}>
        <div className="bg-bg-weak">
          <div className="flex flex-row items-center justify-between space-y-0 p-1.5">
            <div className="flex items-center gap-1">
              <span className="font-subheading-2x-small text-subheading-2xs text-text-soft">CONFIGURE VARIABLE</span>
            </div>

            <Button variant="ghost" size="icon" className="rounded-6 h-5 w-5 p-0.5">
              <RiDeleteBin2Line className="text-text-soft h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-1.5">
          <div className="grid gap-2 p-2">
            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Variable name</label>
                  <InputField size="fit" className="min-h-0">
                    <Code2 className="text-text-sub h-4 w-4" />
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
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Default value</label>
                  <InputField size="fit" className="min-h-0">
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

          <Separator className="my-0" />

          <div className="flex flex-col gap-1 p-2">
            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Modifiers</label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value) {
                        handleTransformerToggle(value);
                      }
                    }}
                  >
                    <SelectTrigger className="!text-paragraph-xs text-text-soft !h-7 min-h-0 !p-1.5">
                      <SelectValue placeholder="Add a modifier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSFORMERS.filter((transformer) => !transformers.some((t) => t.value === transformer.value))
                        .length === 0 ? (
                        <div className="text-text-soft text-paragraph-xs px-2 py-2">All modifiers have been added</div>
                      ) : (
                        TRANSFORMERS.filter(
                          (transformer) => !transformers.some((t) => t.value === transformer.value)
                        ).map((transformer) => (
                          <SelectItem key={transformer.value} value={transformer.value}>
                            {transformer.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
            </FormItem>

            {/* Selected transformers with drag handles */}
            {transformers.length > 0 && (
              <div className="rounded-8 border-stroke-soft flex flex-col gap-0.5 border px-1 py-1.5">
                <AnimatePresence mode="popLayout">
                  {transformers.map((transformer, index) => {
                    const transformerDef = TRANSFORMERS.find((t) => t.value === transformer.value);
                    return (
                      <motion.div
                        key={transformer.value + index}
                        className="relative mb-1"
                        layout
                        layoutId={transformer.value + index}
                        transition={{
                          layout: { duration: 0.2, ease: 'easeOut' },
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
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
                          className={`group flex cursor-move items-center gap-1.5 ${
                            draggingItem === index ? 'ring-primary opacity-50 ring-2 ring-offset-1' : ''
                          }`}
                          drag="y"
                          dragDirectionLock
                          dragConstraints={{ top: 0, bottom: 0 }}
                          dragElastic={0.1}
                          dragMomentum={false}
                          onDragStart={() => setDraggingItem(index)}
                          onDragEnd={(e, info) => {
                            if (dragOverIndex !== null && draggingItem !== null && draggingItem !== dragOverIndex) {
                              moveTransformer(draggingItem, dragOverIndex);
                            }
                            setDraggingItem(null);
                            setDragOverIndex(null);
                          }}
                          onDrag={(e, info) => {
                            const elements = document.elementsFromPoint(info.point.x, info.point.y);
                            const droppableElement = elements.find(
                              (el) => el.classList.contains('group') && !el.classList.contains('opacity-50')
                            );

                            if (droppableElement) {
                              const index = parseInt(droppableElement.getAttribute('data-index') || '-1');
                              if (index !== -1 && dragOverIndex !== index) {
                                setDragOverIndex(index);
                              }
                            } else {
                              setDragOverIndex(null);
                            }
                          }}
                          data-index={index}
                          animate={draggingItem === index ? { scale: 1.02, zIndex: 50 } : { scale: 1, zIndex: 1 }}
                          whileHover={{ scale: 1.01 }}
                          transition={{
                            duration: 0.15,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                        >
                          <GripVertical className="text-text-soft h-3.5 w-3.5" />
                          <div className="flex flex-1 items-center gap-1">
                            <div className="border-stroke-soft text-text-sub text-paragraph-xs bg-bg-weak rounded-8 flex w-full flex-row items-center border">
                              <div className="px-2 py-1">{transformerDef?.label}</div>
                              {transformerDef?.hasParam && (
                                <Input
                                  value={transformer.param || ''}
                                  onChange={(e) => handleParamChange(index, e.target.value)}
                                  className="border-stroke-soft ml-1 h-[24px] min-w-[60px] flex-1 border-l pl-1 text-xs"
                                  placeholder="Parameter..."
                                />
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-text-soft hover:text-destructive h-4 w-4 p-0"
                            onClick={() => handleTransformerToggle(transformer.value)}
                          >
                            <RiCloseLine className="h-3.5 w-3.5" />
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
          </div>
        </div>
      </div>
    </PopoverContent>
  );
};
