import { useMemo, useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PopoverContent } from '@/components/primitives/popover';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { GripVertical } from 'lucide-react';
import { FormControl, FormItem } from '@/components/primitives/form/form';
import { RiCloseLine } from 'react-icons/ri';
import { Code2 } from '../../icons/code-2';
import { Separator } from '../separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Switch } from '@/components/primitives/switch';

interface Transformer {
  label: string;
  value: string;
  hasParam?: boolean;
  description?: string;
  example?: string;
  params?: {
    placeholder: string;
    description?: string;
    type?: 'string' | 'number';
  }[];
}

const TRANSFORMERS: Transformer[] = [
  // Text Transformations
  {
    label: 'Uppercase',
    value: 'upcase',
    description: 'Convert text to uppercase',
    example: '"hello" | upcase → HELLO',
  },
  {
    label: 'Lowercase',
    value: 'downcase',
    description: 'Convert text to lowercase',
    example: '"HELLO" | downcase → hello',
  },
  {
    label: 'Capitalize',
    value: 'capitalize',
    description: 'Capitalize the first character',
    example: '"hello" | capitalize → Hello',
  },
  {
    label: 'Strip HTML',
    value: 'strip_html',
    description: 'Remove all HTML tags from text',
    example: '"<p>text</p>" | strip_html → text',
  },
  {
    label: 'Strip Newlines',
    value: 'strip_newlines',
    description: 'Remove all newline characters',
    example: '"hello\\nworld" | strip_newlines → hello world',
  },
  {
    label: 'Escape',
    value: 'escape',
    description: 'Escape special characters',
    example: '"<hello>" | escape → &lt;hello&gt;',
  },
  {
    label: 'Truncate',
    value: 'truncate',
    hasParam: true,
    description: 'Truncate text to specified length',
    example: '"hello world" | truncate: 5 → hello...',
    params: [{ placeholder: 'Length (e.g. 20)', type: 'number' }],
  },
  {
    label: 'Truncate Words',
    value: 'truncatewords',
    hasParam: true,
    description: 'Truncate text to specified number of words',
    example: '"hello world and more" | truncatewords: 2 → hello world...',
    params: [{ placeholder: 'Word count', type: 'number' }],
  },
  {
    label: 'Replace',
    value: 'replace',
    hasParam: true,
    description: 'Replace all occurrences of a string',
    example: '"Hello Hello" | replace: "Hello", "Hi" → Hi Hi',
    params: [
      { placeholder: 'Search text', type: 'string' },
      { placeholder: 'Replace with', type: 'string' },
    ],
  },
  {
    label: 'Replace First',
    value: 'replace_first',
    hasParam: true,
    description: 'Replace first occurrence of a string',
    example: '"Hello Hello" | replace_first: "Hello", "Hi" → Hi Hello',
    params: [
      { placeholder: 'Search text', type: 'string' },
      { placeholder: 'Replace with', type: 'string' },
    ],
  },
  {
    label: 'Remove',
    value: 'remove',
    hasParam: true,
    description: 'Remove all occurrences of a string',
    example: '"Hello Hello" | remove: "ello" → H H',
    params: [{ placeholder: 'Text to remove', type: 'string' }],
  },
  {
    label: 'Remove First',
    value: 'remove_first',
    hasParam: true,
    description: 'Remove first occurrence of a string',
    example: '"Hello Hello" | remove_first: "ello" → H Hello',
    params: [{ placeholder: 'Text to remove', type: 'string' }],
  },
  {
    label: 'Append',
    value: 'append',
    hasParam: true,
    description: 'Add text to the end',
    example: '"Hello" | append: " World" → Hello World',
    params: [{ placeholder: 'Text to append', type: 'string' }],
  },
  {
    label: 'Prepend',
    value: 'prepend',
    hasParam: true,
    description: 'Add text to the beginning',
    example: '"World" | prepend: "Hello " → Hello World',
    params: [{ placeholder: 'Text to prepend', type: 'string' }],
  },
  {
    label: 'Slice',
    value: 'slice',
    hasParam: true,
    description: 'Extract a substring by position',
    example: '"hello" | slice: 0, 2 → he',
    params: [
      { placeholder: 'Start index', type: 'number' },
      { placeholder: 'Length (optional)', type: 'number' },
    ],
  },

  // Number Operations
  {
    label: 'Plus',
    value: 'plus',
    hasParam: true,
    description: 'Add a number',
    example: '5 | plus: 3 → 8',
    params: [{ placeholder: 'Number to add', type: 'number' }],
  },
  {
    label: 'Minus',
    value: 'minus',
    hasParam: true,
    description: 'Subtract a number',
    example: '5 | minus: 3 → 2',
    params: [{ placeholder: 'Number to subtract', type: 'number' }],
  },
  {
    label: 'Times',
    value: 'times',
    hasParam: true,
    description: 'Multiply by a number',
    example: '5 | times: 3 → 15',
    params: [{ placeholder: 'Number to multiply by', type: 'number' }],
  },
  {
    label: 'Divided By',
    value: 'divided_by',
    hasParam: true,
    description: 'Divide by a number',
    example: '10 | divided_by: 2 → 5',
    params: [{ placeholder: 'Number to divide by', type: 'number' }],
  },
  {
    label: 'Round',
    value: 'round',
    hasParam: true,
    description: 'Round to specified decimal places',
    example: '4.5678 | round: 2 → 4.57',
    params: [{ placeholder: 'Decimal places', type: 'number' }],
  },
  {
    label: 'Floor',
    value: 'floor',
    description: 'Round down to nearest integer',
    example: '4.6 | floor → 4',
  },
  {
    label: 'Ceil',
    value: 'ceil',
    description: 'Round up to nearest integer',
    example: '4.3 | ceil → 5',
  },
  {
    label: 'Abs',
    value: 'abs',
    description: 'Get absolute value',
    example: '-5 | abs → 5',
  },

  // Data Formatting
  {
    label: 'Date Format',
    value: 'date',
    hasParam: true,
    description: 'Format a date using strftime format',
    example: '"2024-01-20" | date: "%B %d, %Y" → January 20, 2024',
    params: [{ placeholder: 'Format (e.g. "%Y-%m-%d")', description: 'strftime format', type: 'string' }],
  },
  {
    label: 'Default',
    value: 'default',
    hasParam: true,
    description: 'Use default value if input is empty',
    example: '"" | default: "N/A" → N/A',
    params: [{ placeholder: 'Default value', type: 'string' }],
  },
  {
    label: 'JSON',
    value: 'json',
    description: 'Convert object to JSON string',
    example: '{name: "John"} | json → {"name":"John"}',
  },
  {
    label: 'Size',
    value: 'size',
    description: 'Get length of string or array',
    example: '"hello" | size → 5',
  },
  {
    label: 'Join',
    value: 'join',
    hasParam: true,
    description: 'Join array elements with separator',
    example: '["a","b"] | join: ", " → a, b',
    params: [{ placeholder: 'Separator (e.g. ", ")', type: 'string' }],
  },
  {
    label: 'Split',
    value: 'split',
    hasParam: true,
    description: 'Split string into array',
    example: '"a,b" | split: "," → ["a","b"]',
    params: [{ placeholder: 'Delimiter', type: 'string' }],
  },
  {
    label: 'First',
    value: 'first',
    description: 'Get first element of array',
    example: '[1,2,3] | first → 1',
  },
  {
    label: 'Last',
    value: 'last',
    description: 'Get last element of array',
    example: '[1,2,3] | last → 3',
  },
  {
    label: 'Map',
    value: 'map',
    hasParam: true,
    description: 'Extract property from each item in array',
    example: 'users | map: "name" → ["John", "Jane"]',
    params: [{ placeholder: 'Property name', type: 'string' }],
  },
  {
    label: 'Where',
    value: 'where',
    hasParam: true,
    description: 'Filter array by property value',
    example: 'users | where: "active", true → [activeUsers]',
    params: [
      { placeholder: 'Property name', type: 'string' },
      { placeholder: 'Value to match', type: 'string' },
    ],
  },
  {
    label: 'URL Encode',
    value: 'url_encode',
    description: 'Encode string for use in URL',
    example: '"hello world" | url_encode → hello%20world',
  },
  {
    label: 'URL Decode',
    value: 'url_decode',
    description: 'Decode URL-encoded string',
    example: '"hello%20world" | url_decode → hello world',
  },
];

interface TransformerWithParam {
  value: string;
  params?: string[];
}

interface VariablePopoverProps {
  variable: string;
  onClose: () => void;
  onUpdate: (newValue: string) => void;
}

const TransformerItem = ({ transformer }: { transformer: Transformer }) => {
  return (
    <div className="flex w-full flex-col py-1">
      <div className="flex items-center gap-1">
        <span className="font-medium">{transformer.label}</span>{' '}
      </div>
      <code className="text-text-sub text-[10px]"> {transformer.description}</code>

      {transformer.example && (
        <div className="bg-bg-weak rounded-6 mt-1 w-full max-w-[270px] p-1">
          <code className="text-text-sub font-mono text-[10px]">{transformer.example}</code>
        </div>
      )}
    </div>
  );
};

export const VariablePopover = ({ variable, onClose, onUpdate }: VariablePopoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    const defaultVal = defaultMatch ? defaultMatch[1].trim().replace(/^["']|["']$/g, '') : '';

    // Get all transformers with their parameters
    const transforms =
      rest?.reduce<TransformerWithParam[]>((acc, part) => {
        const [transformerValue, ...paramValues] = part.split(':').map((p) => p.trim());
        if (TRANSFORMERS.some((t) => t.value === transformerValue)) {
          // Parse parameters, handling quoted values and commas
          const params =
            paramValues.length > 0
              ? paramValues
                  .join(':')
                  .split(',')
                  .map((param) => param.trim().replace(/^['"]|['"]$/g, ''))
              : undefined;

          acc.push({ value: transformerValue, ...(params ? { params } : {}) });
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
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingRef = useRef(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [showRawLiquid, setShowRawLiquid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatParamValue = (param: string, type?: 'string' | 'number') => {
    if (type === 'number') {
      return param;
    }
    return `'${param}'`;
  };

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
            parts.push(`default: "${newDefaultVal.trim()}"`);
          }

          // Add transformers in order with their parameters
          parts.push(
            ...newTransformers.map((t) => {
              const transformerDef = TRANSFORMERS.find((def) => def.value === t.value);
              if (!t.params?.length) return t.value;
              return `${t.value}: ${t.params
                .map((param, index) => formatParamValue(param, transformerDef?.params?.[index]?.type))
                .join(', ')}`;
            })
          );

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

  const handleParamChange = (index: number, params: string[]) => {
    setTransformers((current) => {
      const newTransformers = [...current];
      const transformerDef = TRANSFORMERS.find((def) => def.value === newTransformers[index].value);

      // Format params based on their types
      const formattedParams = params.map((param, paramIndex) => {
        const paramType = transformerDef?.params?.[paramIndex]?.type;
        if (paramType === 'number') {
          // Remove any non-numeric characters except decimal point
          const numericValue = param.replace(/[^\d.-]/g, '');
          // Return empty string if not a valid number
          return isNaN(Number(numericValue)) ? '' : numericValue;
        }
        return param;
      });

      newTransformers[index] = { ...newTransformers[index], params: formattedParams };
      return newTransformers;
    });
  };

  const handleRawLiquidChange = (value: string) => {
    // Remove {{ and }} and trim
    const content = value.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();

    // Split by pipe and trim each part
    const parts = content.split('|').map((part) => part.trim());

    // First part is the name
    const newName = parts[0];
    let newDefaultVal = '';
    const newTransformers: TransformerWithParam[] = [];

    // Process each part after the name
    parts.slice(1).forEach((part) => {
      if (part.startsWith('default:')) {
        // Extract default value, handling quotes
        newDefaultVal = part
          .replace('default:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
      } else {
        // Handle transformers
        const [transformerValue, ...paramValues] = part.split(':').map((p) => p.trim());
        if (TRANSFORMERS.some((t) => t.value === transformerValue)) {
          const transformerDef = TRANSFORMERS.find((t) => t.value === transformerValue);

          // Parse parameters, handling quoted values and types
          const params =
            paramValues.length > 0
              ? paramValues
                  .join(':')
                  .split(',')
                  .map((param, index) => {
                    const paramType = transformerDef?.params?.[index]?.type;
                    const cleanParam = param.trim().replace(/^['"]|['"]$/g, '');

                    if (paramType === 'number') {
                      // For number type, remove any non-numeric characters
                      const numericValue = cleanParam.replace(/[^\d.-]/g, '');
                      return isNaN(Number(numericValue)) ? '' : numericValue;
                    }
                    return cleanParam;
                  })
              : undefined;

          newTransformers.push({
            value: transformerValue,
            ...(params ? { params } : {}),
          });
        }
      }
    });

    setName(newName);
    setDefaultVal(newDefaultVal);
    setTransformers(newTransformers);
  };

  // Filter function for transformers
  const getFilteredTransformers = useCallback(
    (query: string) => {
      const normalizedQuery = query.toLowerCase();
      return TRANSFORMERS.filter((transformer) => {
        if (transformers.some((t) => t.value === transformer.value)) return false;

        return (
          transformer.label.toLowerCase().includes(normalizedQuery) ||
          transformer.description?.toLowerCase().includes(normalizedQuery) ||
          transformer.value.toLowerCase().includes(normalizedQuery)
        );
      });
    },
    [transformers]
  );

  return (
    <PopoverContent className="w-72 p-0">
      <div ref={containerRef}>
        <div className="bg-bg-weak">
          <div className="flex flex-row items-center justify-between space-y-0 p-1.5">
            <div className="flex items-center gap-1">
              <span className="font-subheading-2x-small text-subheading-2xs text-text-soft">CONFIGURE VARIABLE</span>
            </div>
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
            <FormItem>
              <FormControl>
                <div className="flex items-center justify-between">
                  <label className="text-text-sub text-label-xs">Show raw liquid</label>
                  <Switch checked={showRawLiquid} onCheckedChange={setShowRawLiquid} className="scale-75" />
                </div>
              </FormControl>
            </FormItem>
            {showRawLiquid && (
              <FormItem>
                <FormControl>
                  <div className="grid gap-1">
                    <InputField size="fit" className="min-h-0">
                      <Input
                        value={`{{ ${name}${defaultVal ? ` | default: "${defaultVal}"` : ''}${
                          transformers.length > 0
                            ? ' | ' +
                              transformers
                                .map((t) => {
                                  const transformerDef = TRANSFORMERS.find((def) => def.value === t.value);
                                  if (!t.params?.length) return t.value;
                                  return `${t.value}: ${t.params
                                    .map((param, index) =>
                                      formatParamValue(param, transformerDef?.params?.[index]?.type)
                                    )
                                    .join(', ')}`;
                                })
                                .join(' | ')
                            : ''
                        } }}`}
                        onChange={(e) => handleRawLiquidChange(e.target.value)}
                        className="h-7 text-sm"
                      />
                    </InputField>
                  </div>
                </FormControl>
              </FormItem>
            )}
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
                        setSearchQuery('');
                      }
                    }}
                  >
                    <SelectTrigger className="!text-paragraph-xs text-text-soft !h-7 min-h-0 !p-1.5">
                      <SelectValue placeholder="Add a modifier..." />
                    </SelectTrigger>
                    <SelectContent
                      onCloseAutoFocus={(e) => {
                        e.preventDefault();
                        searchInputRef.current?.focus();
                      }}
                      className="max-h-[400px]"
                      align="start"
                    >
                      <div className="p-2">
                        <InputField size="fit" className="min-h-0">
                          <Input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSearchQuery(e.target.value);
                            }}
                            className="h-7 text-sm"
                            placeholder="Search modifiers..."
                            autoFocus
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Escape') {
                                setSearchQuery('');
                              }
                            }}
                          />
                        </InputField>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto px-1">
                        {getFilteredTransformers(searchQuery).length === 0 ? (
                          <div className="text-text-soft flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="text-sm">
                              {searchQuery ? 'No modifiers found' : 'All modifiers have been added'}
                            </span>
                            {searchQuery && <span className="text-xs">Try searching for different terms</span>}
                          </div>
                        ) : (
                          <>
                            {getFilteredTransformers(searchQuery).map((transformer) => (
                              <SelectItem
                                key={transformer.value}
                                value={transformer.value}
                                className="relative [&>*:first-child]:p-0"
                              >
                                <TransformerItem transformer={transformer} />
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </div>
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
                        className={`relative ${index !== transformers.length - 1 ? 'mb-1' : ''}`}
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
                          transition={{
                            duration: 0.15,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                        >
                          <GripVertical className="text-text-soft h-3.5 w-3.5" />
                          <div className="flex flex-1 items-center gap-1">
                            <div className="border-stroke-soft text-text-sub text-paragraph-xs bg-bg-weak rounded-8 flex w-full flex-row items-center border">
                              <div className="px-2 py-1.5">{transformerDef?.label}</div>
                              {transformerDef?.hasParam && transformerDef.params && (
                                <div className="flex flex-1 flex-col gap-1 py-1">
                                  {transformerDef.params.map((param, paramIndex) => (
                                    <Input
                                      key={paramIndex}
                                      value={transformer.params?.[paramIndex] || ''}
                                      onChange={(e) => {
                                        const newParams = [...(transformer.params || [])];
                                        newParams[paramIndex] = e.target.value;
                                        handleParamChange(index, newParams);
                                      }}
                                      className="border-stroke-soft ml-1 h-[20px] w-[calc(100%-8px)] border-l pl-1 text-xs"
                                      placeholder={param.placeholder}
                                      title={param.description}
                                    />
                                  ))}
                                </div>
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
