import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/primitives/command';
import { FormControl, FormItem } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Switch } from '@/components/primitives/switch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { useDebounce } from '../../../../hooks/use-debounce';
import { Code2 } from '../../../icons/code-2';
import { Separator } from '../../separator';
import { TransformerItem } from './components/transformer-item';
import { TransformerList } from './components/transformer-list';
import { useSuggestedTransformers } from './hooks/use-suggested-transformers';
import { useTransformerManager } from './hooks/use-transformer-manager';
import { useVariableParser } from './hooks/use-variable-parser';
import type { VariablePopoverProps } from './types';
import { formatLiquidVariable } from './utils';

export function VariablePopover({ variable, onUpdate }: VariablePopoverProps) {
  const { parsedName, parsedDefaultValue, parsedTransformers, originalVariable } = useVariableParser(variable || '');
  const [name, setName] = useState(parsedName);
  const [defaultVal, setDefaultVal] = useState(parsedDefaultValue);
  const [showRawLiquid, setShowRawLiquid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    setName(parsedName);
    setDefaultVal(parsedDefaultValue);
  }, [parsedName, parsedDefaultValue]);

  const updateVariable = useCallback(
    (newName: string, newDefaultVal: string, newTransformers: any[]) => {
      onUpdate(formatLiquidVariable(newName, newDefaultVal, newTransformers));
    },
    [onUpdate]
  );

  const debouncedUpdate = useDebounce(updateVariable, 300);

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
      debouncedUpdate(name, defaultVal, newTransformers);
    },
  });

  const handleNameChange = useCallback(
    (newName: string) => {
      setName(newName);
      debouncedUpdate(newName, defaultVal, transformers);
    },
    [defaultVal, transformers, debouncedUpdate]
  );

  const handleDefaultValueChange = useCallback(
    (newDefaultVal: string) => {
      setDefaultVal(newDefaultVal);
      debouncedUpdate(name, newDefaultVal, transformers);
    },
    [name, transformers, debouncedUpdate]
  );

  const handleRawLiquidChange = useCallback((value: string) => {
    const content = value.replace(/^\{\{\s*|\s*\}\}$/g, '').trim();

    const parts = content.split('|').map((part) => part.trim());

    const newName = parts[0];
    setName(newName);

    // Process each part after the name
    parts.slice(1).forEach((part) => {
      if (part.startsWith('default:')) {
        const newDefaultVal = part
          .replace('default:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        setDefaultVal(newDefaultVal);
      }
    });
  }, []);

  const suggestedTransformers = useSuggestedTransformers(name, transformers);

  const filteredTransformers = useMemo(
    () => getFilteredTransformers(searchQuery),
    [getFilteredTransformers, searchQuery]
  );

  const currentLiquidValue = useMemo(
    () => originalVariable || formatLiquidVariable(name, defaultVal, transformers),
    [originalVariable, name, defaultVal, transformers]
  );

  return (
    <PopoverContent className="w-72 p-0 pb-1">
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
                    <Code2 className="text-text-sub h-4 w-4 min-w-4" />
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
                        value={currentLiquidValue}
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
                  <Popover open={isCommandOpen} onOpenChange={setIsCommandOpen}>
                    <PopoverTrigger asChild>
                      <button className="text-text-soft bg-background flex h-[30px] w-full items-center justify-between rounded-md border px-2 text-sm">
                        <span>Add a modifier...</span>
                        <RiAddFill className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <div className="p-1">
                          <CommandInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search modifiers..."
                            inputFieldClassName="h-7"
                          />
                        </div>

                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No modifiers found</CommandEmpty>
                          {suggestedTransformers.length > 0 && !searchQuery && (
                            <>
                              <CommandGroup heading="Suggested">
                                {suggestedTransformers[0].transformers.map((transformer) => (
                                  <CommandItem
                                    key={transformer.value}
                                    onSelect={() => {
                                      handleTransformerToggle(transformer.value);
                                      setSearchQuery('');
                                      setIsCommandOpen(false);
                                    }}
                                  >
                                    <TransformerItem transformer={transformer} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              {filteredTransformers.length > 0 && <CommandSeparator />}
                            </>
                          )}
                          {filteredTransformers.length > 0 && (
                            <CommandGroup heading={searchQuery ? 'Search Results' : 'All Modifiers'}>
                              {filteredTransformers.map((transformer) => (
                                <CommandItem
                                  key={transformer.value}
                                  onSelect={() => {
                                    handleTransformerToggle(transformer.value);
                                    setSearchQuery('');
                                    setIsCommandOpen(false);
                                  }}
                                >
                                  <TransformerItem transformer={transformer} />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
