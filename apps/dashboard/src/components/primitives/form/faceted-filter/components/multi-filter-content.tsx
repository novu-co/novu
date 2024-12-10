import { Check } from 'lucide-react';
import { cn } from '../../../../../utils/ui';
import { FilterOption, SizeType } from '../types';
import { STYLES } from '../styles';
import { FilterInput } from './filter-input';
import { ClearButton } from './clear-button';
import { RiArrowDownLine, RiArrowUpLine } from 'react-icons/ri';
import { EnterLineIcon } from '../../../../icons/enter-line';
import { useEffect, useState } from 'react';

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
  hideSearch?: boolean;
  hideClear?: boolean;
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
  hideSearch = false,
  hideClear = false,
}: MultiFilterContentProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (options.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            onSelect(options[focusedIndex].value);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, options, onSelect]);

  return (
    <div className="p-0">
      <div className="flex justify-between rounded-t-md bg-neutral-50 px-1.5 py-0.5">
        {title && <span className="text-foreground-400 text-[11px] uppercase">{title}</span>}
        {!hideClear && selectedValues.size > 0 && <ClearButton onClick={onClear} size={size} label="Reset" />}
      </div>
      {!hideSearch && (
        <FilterInput
          inputRef={inputRef}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${title}...`}
          size={size}
        />
      )}
      <div className={cn('flex flex-col gap-1 p-1')}>
        {options.map((option, index) => {
          const isSelected = selectedValues.has(option.value);
          const isFocused = index === focusedIndex;

          return (
            <div
              key={option.value}
              onClick={() => onSelect(option.value)}
              onMouseEnter={() => setFocusedIndex(index)}
              className={cn(
                'flex cursor-pointer items-center rounded-[6px] p-1 hover:bg-[#F8F8F8]',
                isSelected && 'bg-[#F8F8F8]',
                isFocused && 'ring-1 ring-neutral-200'
              )}
            >
              {option.icon && <option.icon className="mr-2 h-4 w-4 text-[#737373]" />}
              <span className="text-xs font-normal text-[#404040]">{option.label}</span>
              {isSelected && (
                <div className={'ml-auto'}>
                  <Check className="h-2.5 w-2.5 text-neutral-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between rounded-b-md border-t border-neutral-100 bg-white p-1">
        <div className="flex items-center gap-0.5">
          <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,_0px_1px_4px_0px_rgba(14,18,27,0.12)]">
            <RiArrowUpLine className="h-3 w-3 text-neutral-400" />
          </div>
          <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,_0px_1px_4px_0px_rgba(14,18,27,0.12)]">
            <RiArrowDownLine className="h-3 w-3 text-neutral-400" />
          </div>
          <span className="text-foreground-500 ml-1.5 text-xs font-normal">Navigate</span>
        </div>
        <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,_0px_1px_4px_0px_rgba(14,18,27,0.12)]">
          <EnterLineIcon className="h-3 w-3 text-neutral-400" />
        </div>
      </div>
    </div>
  );
}
