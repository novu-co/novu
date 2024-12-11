import { cn } from '@/utils/ui';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input } from '@/components/primitives/input';
import { InputFieldPure } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { useFormContext } from 'react-hook-form';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '@/utils/constants';

const HEIGHT = {
  sm: {
    base: 'h-7',
    trigger: 'h-[26px]',
  },
  md: {
    base: 'h-9',
    trigger: 'h-[34px]',
  },
} as const;

type InputWithSelectProps = {
  fields: {
    inputKey: string;
    selectKey: string;
  };
  options: string[];
  defaultOption?: string;
  className?: string;
  placeholder?: string;
  isReadOnly?: boolean;
  onValueChange?: (value: string) => void;
  size?: 'sm' | 'md';
  min?: number;
  showError?: boolean;
};

export const AmountInput = ({
  fields,
  options,
  defaultOption,
  className,
  placeholder,
  isReadOnly,
  onValueChange,
  size = 'sm',
  min,
  showError = true,
}: InputWithSelectProps) => {
  const { getFieldState, setValue, control } = useFormContext();

  const input = getFieldState(`${fields.inputKey}`);
  const select = getFieldState(`${fields.selectKey}`);
  const error = input.error || select.error;

  return (
    <>
      <InputFieldPure
        className={cn(HEIGHT[size].base, 'rounded-lg border pr-0', className)}
        state={input.error ? 'error' : 'default'}
      >
        <FormField
          control={control}
          name={fields.inputKey}
          render={({ field }) => (
            <FormItem className="w-full overflow-hidden">
              <FormControl>
                <Input
                  type="number"
                  className="min-w-[20ch] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder={placeholder}
                  disabled={isReadOnly}
                  value={field.value}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === '-' || e.key === '+' || e.key === '.' || e.key === ',') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      field.onChange('');
                      return;
                    }

                    const numberValue = Number(e.target.value);
                    field.onChange(numberValue);
                  }}
                  min={min}
                  {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={fields.selectKey}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  onValueChange={(value) => {
                    setValue(fields.selectKey, value, { shouldDirty: true });
                    onValueChange?.(value);
                  }}
                  defaultValue={defaultOption}
                  disabled={isReadOnly}
                  value={field.value}
                >
                  <SelectTrigger
                    className={cn(
                      HEIGHT[size].trigger,
                      'w-auto gap-1 rounded-l-none border-x-0 border-y-0 border-l bg-neutral-50 p-2 text-xs'
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </InputFieldPure>
      {showError && <FormMessagePure error={error ? String(error.message) : undefined} />}
    </>
  );
};
