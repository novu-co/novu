import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { cn } from '../../utils/ui';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <Input
        type="text"
        className="text-foreground-600 w-[60px] py-1 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="h-4 w-4 cursor-pointer rounded-full border shadow-sm transition-shadow hover:shadow-md"
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
          <HexColorPicker color={value} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
