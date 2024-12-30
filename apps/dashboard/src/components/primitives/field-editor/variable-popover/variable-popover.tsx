import { useState, useRef, useEffect } from 'react';
import { PopoverContent } from '@/components/primitives/popover';
import { Input, InputField } from '@/components/primitives/input';
import { FormControl, FormItem } from '@/components/primitives/form/form';
import { Switch } from '@/components/primitives/switch';
import { Code2 } from '../../../icons/code-2';
import { Separator } from '../../separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { TransformerItem } from './components/transformer-item';
import { TransformerList } from './components/transformer-list';
import { DigestWidget } from './components/digest-widget';
import { useVariableParser } from './hooks/use-variable-parser';
import { useTransformerManager } from './hooks/use-transformer-manager';
import { formatLiquidVariable } from './utils';
import type { VariablePopoverProps } from './types';
import type { TransformerWithParam } from './types';

export function VariablePopover({ variable, onClose, onUpdate }: VariablePopoverProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { parsedName, parsedDefaultValue, parsedTransformers } = useVariableParser(variable);
  const [name, setName] = useState(parsedName);
  const [defaultVal, setDefaultVal] = useState(parsedDefaultValue);
  const [showRawLiquid, setShowRawLiquid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const {
    transformers,
    dragOverIndex,
    draggingItem,
    setDragOverIndex,
    setDraggingItem,
    handleTransformerToggle,
    moveTransformer,
    handleParamChange,
    getFilteredTransformers,
  } = useTransformerManager({
    initialTransformers: parsedTransformers,
    onUpdate: (newTransformers) => {
      onUpdate(formatLiquidVariable(name, defaultVal, newTransformers));
    },
  });

  const handleNameChange = (newName: string) => {
    setName(newName);
    onUpdate(formatLiquidVariable(newName, defaultVal, transformers));
  };

  const handleDefaultValueChange = (newDefaultVal: string) => {
    setDefaultVal(newDefaultVal);
    onUpdate(formatLiquidVariable(name, newDefaultVal, transformers));
  };

  const handleRawLiquidChange = (value: string) => {
    // Remove {{ and }} and trim
    const content = value.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();

    // Split by pipe and trim each part
    const parts = content.split('|').map((part) => part.trim());

    // First part is the name
    const newName = parts[0];
    setName(newName);

    // Reset default value and transformers
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
      } else if (part.startsWith('digest:')) {
        // Handle digest transformer
        const digestMatch = part.match(/digest:\s*(\d+)(?:,\s*['"]([^'"]*)['"]\s*)?(?:,\s*['"]([^'"]*)['"]\s*)?/);
        if (digestMatch) {
          const [, maxNames = '2', keyPath = '', separator = ''] = digestMatch;
          const params = [maxNames];
          if (keyPath !== undefined) params.push(keyPath);
          if (separator !== undefined) params.push(separator);
          newTransformers.push({ value: 'digest', params });
        } else {
          // If no match but starts with digest, it's being edited
          const digestParams = part.replace('digest:', '').trim();
          newTransformers.push({
            value: 'digest',
            params: digestParams ? digestParams.split(',').map((p) => p.trim().replace(/^["']|["']$/g, '')) : ['2'],
          });
        }
      } else {
        // Handle other transformers
        const [transformerName, ...params] = part.split(':').map((p) => p.trim());
        if (transformerName) {
          newTransformers.push({
            value: transformerName,
            params:
              params.length > 0 ? params[0].split(',').map((p) => p.trim().replace(/^["']|["']$/g, '')) : undefined,
          });
        }
      }
    });

    setDefaultVal(newDefaultVal);
    transformers.length = 0;
    transformers.push(...newTransformers);
    onUpdate(`{{${content}}}`);
  };

  return (
    <PopoverContent className="w-72 p-0">
      <div>
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
                    <Input value={name} onChange={(e) => handleNameChange(e.target.value)} className="h-7 text-sm" />
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
                      onChange={(e) => handleDefaultValueChange(e.target.value)}
                      className="h-7 text-sm"
                    />
                  </InputField>
                </div>
              </FormControl>
            </FormItem>

            <DigestWidget
              value={formatLiquidVariable(name, defaultVal, transformers)}
              onChange={(newValue) => {
                handleRawLiquidChange(newValue);
              }}
            />

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
                        value={formatLiquidVariable(name, defaultVal, transformers)}
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
                          getFilteredTransformers(searchQuery).map((transformer) => (
                            <SelectItem
                              key={transformer.value}
                              value={transformer.value}
                              className="relative [&>*:first-child]:p-0"
                            >
                              <TransformerItem transformer={transformer} />
                            </SelectItem>
                          ))
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
            </FormItem>

            <TransformerList
              transformers={transformers}
              dragOverIndex={dragOverIndex}
              draggingItem={draggingItem}
              onDragStart={setDraggingItem}
              onDragEnd={() => {
                if (dragOverIndex !== null && draggingItem !== null && draggingItem !== dragOverIndex) {
                  moveTransformer(draggingItem, dragOverIndex);
                }
                setDraggingItem(null);
                setDragOverIndex(null);
              }}
              onDrag={(_, info) => {
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
              onRemove={handleTransformerToggle}
              onParamChange={handleParamChange}
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  );
}
