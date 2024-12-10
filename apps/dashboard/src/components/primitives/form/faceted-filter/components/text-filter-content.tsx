import { SizeType } from '../types';
import { STYLES } from '../styles';
import { FilterInput } from './filter-input';
import { ClearButton } from './clear-button';
import { cn } from '../../../../../utils/ui';

interface TextFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  size: SizeType;
  hideSearch?: boolean;
  hideClear?: boolean;
}

export function TextFilterContent({
  inputRef,
  value,
  onChange,
  onClear,
  placeholder,
  size,
  hideSearch = false,
  hideClear = false,
}: TextFilterContentProps) {
  return (
    <div>
      {!hideSearch && (
        <FilterInput
          inputRef={inputRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          size={size}
          showEnterIcon={true}
        />
      )}
      {!hideClear && value && <ClearButton onClick={onClear} size={size} separatorClassName="mt-0" />}
    </div>
  );
}
