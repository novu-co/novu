import { RadioGroup, RadioGroupItem } from '../../../radio-group';
import { Label } from '../../../label';
import { FilterOption, SizeType } from '../types';
import { STYLES } from '../styles';
import { FilterInput } from './filter-input';
import { ClearButton } from './clear-button';
import { cn } from '../../../../../utils/ui';

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
  hideSearch?: boolean;
  hideClear?: boolean;
}

export function SingleFilterContent({
  inputRef,
  title,
  options,
  selectedValues,
  onSelect,
  onClear,
  searchQuery,
  onSearchChange,
  size,
  hideSearch = false,
  hideClear = false,
}: SingleFilterContentProps) {
  return (
    <div className={STYLES.size[size].content}>
      {!hideSearch && (
        <FilterInput
          inputRef={inputRef}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${title}...`}
          size={size}
        />
      )}
      <div className={cn('mt-2', hideSearch && 'mt-0')}>
        <RadioGroup value={Array.from(selectedValues)[0] || ''} onValueChange={onSelect}>
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 py-1">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      {!hideClear && selectedValues.size > 0 && <ClearButton onClick={onClear} size={size} label="Clear selection" />}
    </div>
  );
}
