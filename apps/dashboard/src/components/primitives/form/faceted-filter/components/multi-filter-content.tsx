import { Check } from 'lucide-react';
import { cn } from '../../../../../utils/ui';
import { FilterOption, SizeType } from '../types';
import { STYLES } from '../styles';
import { FilterInput } from './filter-input';
import { ClearButton } from './clear-button';

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

export function MultiFilterContent({
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
