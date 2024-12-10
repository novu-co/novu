import * as React from 'react';
import { Check, PlusCircle } from 'lucide-react';
import { Button } from '../button';
import { Badge } from '../badge';
import { cn } from '../../../utils/ui';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Separator } from '../separator';
import { Input } from '../input';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Label } from '../label';

type ValueType = 'single' | 'multi' | 'text';
type SizeType = 'default' | 'small';

interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FacetedFilterProps {
  title?: string;
  type?: ValueType;
  size?: SizeType;
  options?: FilterOption[];
  selected?: string[];
  onSelect?: (values: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STYLES = {
  size: {
    default: {
      trigger: 'h-8',
      input: 'h-8',
      content: 'p-2',
      item: 'py-1.5 px-2',
      badge: 'px-2 py-0.5 text-xs',
      separator: 'h-4',
    },
    small: {
      trigger: 'h-7 px-1.5 py-1.5',
      input: 'h-7 px-2 py-1.5',
      content: 'p-1.5',
      item: 'py-1 px-1.5',
      badge: 'px-1.5 py-0 text-[11px]',
      separator: 'h-3.5 mx-1',
    },
  },
  input: {
    base: 'border-neutral-200 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 focus:ring-offset-0',
    text: 'text-neutral-600',
  },
  clearButton: 'w-full justify-center px-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
} as const;

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

interface FilterBadgeProps {
  content: React.ReactNode;
  size: SizeType;
  className?: string;
}

function FilterBadge({ content, size, className }: FilterBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-sm border-neutral-200 font-normal text-neutral-600', STYLES.size[size].badge, className)}
    >
      {content}
    </Badge>
  );
}

interface ClearButtonProps {
  onClick: () => void;
  size: SizeType;
  label?: string;
}

function ClearButton({ onClick, size, label = 'Clear filter' }: ClearButtonProps) {
  return (
    <>
      <Separator className="my-2" />
      <Button variant="ghost" onClick={onClick} className={cn(STYLES.clearButton, STYLES.size[size].input)}>
        {label}
      </Button>
    </>
  );
}

interface FilterInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  size: SizeType;
}

function FilterInput({ inputRef, value, onChange, placeholder, size }: FilterInputProps) {
  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn('w-full', STYLES.size[size].input, STYLES.input.base, STYLES.input.text)}
    />
  );
}

interface TextFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  size: SizeType;
}

function TextFilterContent({ inputRef, value, onChange, onClear, placeholder, size }: TextFilterContentProps) {
  return (
    <div className={STYLES.size[size].content}>
      <FilterInput inputRef={inputRef} value={value} onChange={onChange} placeholder={placeholder} size={size} />
      {value && <ClearButton onClick={onClear} size={size} />}
    </div>
  );
}

interface SingleFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement>;
  title?: string;
  options: FilterOption[];
  selectedValues: Set<string>;
  onSelect: (value: string) => void;
  onClear: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  size: SizeType;
}

function SingleFilterContent({
  inputRef,
  title,
  options,
  selectedValues,
  onSelect,
  onClear,
  searchQuery,
  onSearchChange,
  size,
}: SingleFilterContentProps) {
  return (
    <div className={STYLES.size[size].content}>
      <FilterInput
        inputRef={inputRef}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Search ${title}...`}
        size={size}
      />
      <div className="mt-2">
        <RadioGroup value={Array.from(selectedValues)[0] || ''} onValueChange={onSelect}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 py-1">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      {selectedValues.size > 0 && <ClearButton onClick={onClear} size={size} label="Clear selection" />}
    </div>
  );
}

interface MultiFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement>;
  title?: string;
  options: FilterOption[];
  selectedValues: Set<string>;
  onSelect: (value: string) => void;
  onClear: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  size: SizeType;
}

function MultiFilterContent({
  inputRef,
  title,
  options,
  selectedValues,
  onSelect,
  onClear,
  searchQuery,
  onSearchChange,
  size,
}: MultiFilterContentProps) {
  return (
    <div className={STYLES.size[size].content}>
      <FilterInput
        inputRef={inputRef}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Search ${title}...`}
        size={size}
      />
      <div className="mt-2">
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <div
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'flex cursor-pointer items-center space-x-2 rounded-sm hover:bg-neutral-50',
                isSelected && 'bg-neutral-50',
                STYLES.size[size].item
              )}
            >
              <div
                className={cn(
                  'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-neutral-200',
                  isSelected ? 'border-neutral-900 bg-neutral-900 text-white' : 'opacity-50 [&_svg]:invisible'
                )}
              >
                <Check className="h-4 w-4" />
              </div>
              {option.icon && <option.icon className="mr-2 h-4 w-4 text-neutral-500" />}
              <span className="text-sm text-neutral-600">{option.label}</span>
            </div>
          );
        })}
      </div>
      {selectedValues.size > 0 && <ClearButton onClick={onClear} size={size} label="Clear filters" />}
    </div>
  );
}
