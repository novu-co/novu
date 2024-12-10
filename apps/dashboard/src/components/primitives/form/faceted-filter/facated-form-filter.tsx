import * as React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '../../button';
import { Separator } from '../../separator';
import { Popover, PopoverContent, PopoverTrigger } from '../../popover';
import { cn } from '../../../../utils/ui';
import { FacetedFilterProps } from './types';
import { STYLES } from './styles';
import { FilterBadge } from './components/filter-badge';
import { TextFilterContent } from './components/text-filter-content';
import { SingleFilterContent } from './components/single-filter-content';
import { MultiFilterContent } from './components/multi-filter-content';

export function FacetedFormFilter({
  title,
  type = 'multi',
  size = 'default',
  options = [],
  selected = [],
  onSelect,
  value = '',
  onChange,
  placeholder,
  open,
  onOpenChange,
}: FacetedFilterProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedValues = React.useMemo(() => new Set(selected), [selected]);
  const currentValue = React.useMemo(() => value, [value]);
  const sizes = STYLES.size[size];

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    if (type === 'single') {
      onSelect?.([selectedValue]);
      return;
    }

    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(selectedValue)) {
      newSelectedValues.delete(selectedValue);
    } else {
      newSelectedValues.add(selectedValue);
    }

    onSelect?.(Array.from(newSelectedValues));
  };

  const handleClear = () => {
    if (type === 'text') {
      onChange?.('');
    } else {
      onSelect?.([]);
    }
    setSearchQuery('');
  };

  const renderTriggerContent = () => {
    if (type === 'text' && currentValue) {
      return (
        <>
          <Separator orientation="vertical" className={cn('mx-2', sizes.separator)} />
          <FilterBadge content={currentValue} size={size} />
        </>
      );
    }

    if (selectedValues.size === 0) return null;

    const selectedCount = selectedValues.size;
    const selectedItems = options.filter((option) => selectedValues.has(option.value));

    return (
      <>
        <Separator orientation="vertical" className={cn('mx-2', sizes.separator)} />
        <div className="lg:hidden">
          <FilterBadge content={selectedCount} size={size} />
        </div>
        <div className="hidden space-x-1 lg:flex">
          {selectedCount > 2 && type === 'multi' ? (
            <FilterBadge content={`${selectedCount} selected`} size={size} />
          ) : (
            selectedItems.map((option) => <FilterBadge key={option.value} content={option.label} size={size} />)
          )}
        </div>
      </>
    );
  };

  const renderContent = () => {
    const commonProps = {
      inputRef,
      title,
      size,
      onClear: handleClear,
    };

    if (type === 'text') {
      return (
        <TextFilterContent
          {...commonProps}
          value={currentValue}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      );
    }

    const filterProps = {
      ...commonProps,
      options: filteredOptions,
      selectedValues,
      onSelect: handleSelect,
      searchQuery,
      onSearchChange: (value: string) => setSearchQuery(value),
    };

    return type === 'single' ? <SingleFilterContent {...filterProps} /> : <MultiFilterContent {...filterProps} />;
  };

  const isEmpty = type === 'text' ? !currentValue : selectedValues.size === 0;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-neutral-200 px-1.5 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900',
            isEmpty && 'border-dashed',
            sizes.trigger
          )}
        >
          {isEmpty && <PlusCircle className="h-4 w-4" />}
          {title}
          {renderTriggerContent()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {renderContent()}
      </PopoverContent>
    </Popover>
  );
}

export * from './types';
