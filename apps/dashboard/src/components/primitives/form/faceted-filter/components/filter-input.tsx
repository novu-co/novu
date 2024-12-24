import { Input } from '../../../input';
import { cn } from '../../../../../utils/ui';
import { SizeType } from '../types';
import { STYLES } from '../styles';
import { EnterLineIcon } from '../../../../icons/enter-line';

interface FilterInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  size: SizeType;
  showEnterIcon?: boolean;
}

export function FilterInput({ inputRef, value, onChange, placeholder, size, showEnterIcon = false }: FilterInputProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('w-full', STYLES.size[size].input, STYLES.input.base, STYLES.input.text)}
      />
      {showEnterIcon && (
        <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 p-1">
          <EnterLineIcon className="h-1.5 w-1.5 text-neutral-200" />
        </div>
      )}
    </div>
  );
}
