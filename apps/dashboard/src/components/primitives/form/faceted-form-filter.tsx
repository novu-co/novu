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

const sizeVariants = {
  default: {
    trigger: 'h-8',
    input: 'h-8',
    content: 'p-2',
    item: 'py-1.5 px-2',
    badge: 'px-2 py-0.5 text-xs',
    separator: 'h-4',
  },
  small: {
    trigger: 'h-7 px-2 py-1.5',
    input: 'h-7 px-2 py-1.5',
    content: 'p-1.5',
    item: 'py-1 px-1.5',
    badge: 'px-1.5 py-0 text-[11px]',
    separator: 'h-3.5',
  },
} as const;

const inputStyles = {
  base: 'border-neutral-200 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-0 focus:ring-offset-0',
  text: 'text-neutral-600',
} as const;

interface FacetedFilterProps {
  title?: string;
  type?: ValueType;
  size?: SizeType;
  options?: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  selected?: string[];
  onSelect?: (values: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

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
  const sizes = sizeVariants[size];

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const renderBadge = (content: React.ReactNode, key?: string) => (
    <Badge
      key={key}
      variant="outline"
      className={cn('rounded-sm border-neutral-200 font-normal text-neutral-600', sizes.badge)}
    >
      {content}
    </Badge>
  );

  const renderTriggerContent = () => {
    if (type === 'text') {
      return currentValue ? (
        <>
          <Separator orientation="vertical" className={cn('mx-2', sizes.separator)} />
          {renderBadge(`${currentValue}`)}
        </>
      ) : null;
    }

    if (selectedValues.size === 0) return null;

    const selectedCount = selectedValues.size;
    const selectedItems = options.filter((option) => selectedValues.has(option.value));

    return (
      <>
        <Separator orientation="vertical" className={cn('mx-2', sizes.separator)} />
        <div className="lg:hidden">{renderBadge(selectedCount)}</div>
        <div className="hidden space-x-1 lg:flex">
          {selectedCount > 2 && type === 'multi'
            ? renderBadge(`${selectedCount} selected`)
            : selectedItems.map((option) => renderBadge(option.label, option.value))}
        </div>
      </>
    );
  };

  const renderContent = () => {
    if (type === 'text') {
      return (
        <div className={sizes.content}>
          <Input
            ref={inputRef}
            value={currentValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn('w-full', sizes.input, inputStyles.base, inputStyles.text)}
          />
          {currentValue && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                onClick={handleClear}
                className={cn(
                  'w-full justify-center px-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  sizes.input
                )}
              >
                Clear filter
              </Button>
            </>
          )}
        </div>
      );
    }

    if (type === 'single') {
      return (
        <div className={sizes.content}>
          <Input
            ref={inputRef}
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn('w-full', sizes.input, inputStyles.base, inputStyles.text)}
          />
          <div className="mt-2">
            <RadioGroup value={Array.from(selectedValues)[0] || ''} onValueChange={(value) => handleSelect(value)}>
              {filteredOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          {selectedValues.size > 0 && (
            <>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                onClick={handleClear}
                className={cn(
                  'w-full justify-center px-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                  sizes.input
                )}
              >
                Clear selection
              </Button>
            </>
          )}
        </div>
      );
    }

    return (
      <div className={sizes.content}>
        <Input
          ref={inputRef}
          placeholder={`Search ${title}...`}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={cn('w-full', sizes.input, inputStyles.base, inputStyles.text)}
        />
        <div className="mt-2">
          {filteredOptions.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'flex cursor-pointer items-center space-x-2 rounded-sm hover:bg-neutral-50',
                  isSelected && 'bg-neutral-50',
                  sizes.item
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
                <span className="text-neutral-600">{option.label}</span>
              </div>
            );
          })}
        </div>
        {selectedValues.size > 0 && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              onClick={handleClear}
              className={cn(
                'w-full justify-center px-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                sizes.input
              )}
            >
              Clear filters
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-dashed border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900',
            sizes.trigger
          )}
        >
          {(type === 'text' ? !currentValue : selectedValues.size === 0) && <PlusCircle className="mr-2 h-4 w-4" />}
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
