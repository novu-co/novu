import { Input } from '../../../input';
import { cn } from '../../../../../utils/ui';
import { SizeType } from '../types';
import { STYLES } from '../styles';

interface FilterInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  size: SizeType;
}

export function FilterInput({ inputRef, value, onChange, placeholder, size }: FilterInputProps) {
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
