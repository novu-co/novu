import { cn } from '@/utils/ui';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input } from '@/components/primitives/input';
import { InputFieldPure } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { useFormContext } from 'react-hook-form';

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
};

export const AmountInput = ({
  fields,
  options,
  defaultOption,
  className,
  placeholder,
  isReadOnly,
  onValueChange,
}: InputWithSelectProps) => {
  const { getFieldState, setValue, control } = useFormContext();

  const input = getFieldState(`${fields.inputKey}`);
  const select = getFieldState(`${fields.selectKey}`);
  const error = input.error || select.error;

  return (
    <>
      <InputFieldPure className={cn('h-7 w-auto rounded-lg border pr-0', className)}>
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
                  onChange={(e) => {
                    field.onChange(Number(e.target.value));
                  }}
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
                  <SelectTrigger className="h-7 w-auto translate-x-0.5 gap-1 rounded-l-none border-l bg-neutral-50 p-2 text-xs">
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
      <FormMessagePure error={error ? String(error.message) : undefined} />
    </>
  );
};
