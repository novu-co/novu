import { Button } from '@/components/primitives/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/primitives/command';
import { FormControl, FormItem } from '@/components/primitives/form/form';
import { Input } from '@/components/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Switch } from '@/components/primitives/switch';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Separator } from '../../separator';
import { FilterItem } from './components/filter-item';
import { FiltersList } from './components/filters-list';
import { useFilterManager } from './hooks/use-filter-manager';
import { useVariableParser } from './hooks/use-variable-parser';
import type { FilterWithParam, VariablePopoverProps } from './types';
import { formatLiquidVariable } from './utils';

export function VariablePopover({ variable, onUpdate }: VariablePopoverProps) {
  const { parsedName, parsedDefaultValue, parsedFilters, originalVariable, parseRawInput } = useVariableParser(
    variable || ''
  );
  const [name, setName] = useState(parsedName);
  const [defaultVal, setDefaultVal] = useState(parsedDefaultValue);
  const [showRawLiquid, setShowRawLiquid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [filters, setFilters] = useState<FilterWithParam[]>(parsedFilters || []);

  useEffect(() => {
    setName(parsedName);
    setDefaultVal(parsedDefaultValue);
    setFilters(parsedFilters || []);
  }, [parsedName, parsedDefaultValue, parsedFilters]);

  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
  }, []);

  const handleDefaultValueChange = useCallback((newDefaultVal: string) => {
    setDefaultVal(newDefaultVal);
  }, []);

  const handleRawLiquidChange = useCallback(
    (value: string) => {
      const { parsedName, parsedDefaultValue } = parseRawInput(value);
      setName(parsedName);
      setDefaultVal(parsedDefaultValue);
    },
    [parseRawInput]
  );

  const {
    dragOverIndex,
    draggingItem,
    handleDragStart,
    handleDragEnd,
    handleDrag,
    handleFilterToggle,
    handleParamChange,
    getFilteredFilters,
  } = useFilterManager({
    initialFilters: filters,
    onUpdate: setFilters,
  });

  const filteredFilters = useMemo(() => getFilteredFilters(searchQuery), [getFilteredFilters, searchQuery]);

  const currentLiquidValue = useMemo(
    () => originalVariable || formatLiquidVariable(name, defaultVal, filters),
    [originalVariable, name, defaultVal, filters]
  );

  const handleSave = useCallback(() => {
    onUpdate(formatLiquidVariable(name, defaultVal, filters));
  }, [name, defaultVal, filters, onUpdate]);

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
        <div className="grid">
          <div className="grid gap-2 p-2">
            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Variable name</label>
                  <Input value={name} onChange={(e) => handleNameChange(e.target.value)} className="h-7 text-sm" />
                </div>
              </FormControl>
            </FormItem>

            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Default value</label>
                  <Input
                    value={defaultVal}
                    onChange={(e) => handleDefaultValueChange(e.target.value)}
                    className="h-7 text-sm"
                  />
                </div>
              </FormControl>
            </FormItem>

            <FormItem>
              <FormControl>
                <div className="grid gap-1">
                  <label className="text-text-sub text-label-xs">Filters</label>
                  <Popover open={isCommandOpen} onOpenChange={setIsCommandOpen}>
                    <PopoverTrigger asChild>
                      <button className="text-text-soft bg-background flex h-[30px] w-full items-center justify-between rounded-md border px-2 text-sm">
                        <span>Add a filter...</span>
                        <RiAddFill className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-0" align="start">
                      <Command>
                        <div className="p-1">
                          <CommandInput
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                            placeholder="Search..."
                            className="h-7"
                            inputWrapperClassName="h-7 text-2xs"
                          />
                        </div>

                        <CommandList className="max-h-[300px]">
                          <CommandEmpty>No filters found</CommandEmpty>
                          {filteredFilters.length > 0 && (
                            <CommandGroup>
                              {filteredFilters.map((filter) => (
                                <CommandItem
                                  key={filter.value}
                                  onSelect={() => {
                                    handleFilterToggle(filter.value);
                                    setSearchQuery('');
                                    setIsCommandOpen(false);
                                  }}
                                >
                                  <FilterItem filter={filter} />
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

            <FiltersList
              filters={filters}
              dragOverIndex={dragOverIndex}
              draggingItem={draggingItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
              onRemove={handleFilterToggle}
              onParamChange={handleParamChange}
            />
          </div>

          <Separator className="my-0" />

          <div className="p-2">
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
                    <Input
                      value={currentLiquidValue}
                      onChange={(e) => handleRawLiquidChange(e.target.value)}
                      className="h-7 text-sm"
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          </div>
          <Separator className="my-0" />

          <div className="flex justify-end p-2">
            <Button variant="secondary" mode="filled" size="2xs" onClick={handleSave}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  );
}
