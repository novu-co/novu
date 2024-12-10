import { SizeType } from '../types';
import { STYLES } from '../styles';
import { FilterInput } from './filter-input';
import { ClearButton } from './clear-button';

interface TextFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  size: SizeType;
}

export function TextFilterContent({ inputRef, value, onChange, onClear, placeholder, size }: TextFilterContentProps) {
  return (
    <div className={STYLES.size[size].content}>
      <FilterInput inputRef={inputRef} value={value} onChange={onChange} placeholder={placeholder} size={size} />
      {value && <ClearButton onClick={onClear} size={size} />}
    </div>
  );
}
