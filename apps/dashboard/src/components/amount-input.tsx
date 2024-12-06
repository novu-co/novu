import { cn } from '@/utils/ui';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input } from '@/components/primitives/input';
import { InputFieldPure } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { useFormContext } from 'react-hook-form';

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
  size?: 'sm' | 'md';
};

export const AmountInput = ({
  fields,
  options,
  defaultOption,
  className,
  placeholder,
  isReadOnly,
  size = 'sm',
}: InputWithSelectProps) => {
  const { getFieldState, setValue, getValues, control } = useFormContext();

  const input = getFieldState(`${fields.inputKey}`);
  const select = getFieldState(`${fields.selectKey}`);
  const error = input.error || select.error;

  const handleChange = (value: { input: number; select: string }) => {
    // we want to always set both values and treat it as a single input
    setValue(fields.inputKey, value.input, { shouldDirty: true });
    setValue(fields.selectKey, value.select, { shouldDirty: true });
  };

  return (
    <>
      <InputFieldPure
        className={cn(HEIGHT[size].base, 'rounded-lg border pr-0')}
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
                  className={cn(
                    'min-w-[20ch] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    className
                  )}
                  placeholder={placeholder}
                  disabled={isReadOnly}
                  {...field}
                  onChange={(e) => {
                    handleChange({ input: Number(e.target.value), select: getValues(fields.selectKey) });
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
                    handleChange({ input: Number(getValues(fields.inputKey)), select: value });
                  }}
                  defaultValue={defaultOption}
                  disabled={isReadOnly}
                  {...field}
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
      <FormMessagePure error={error ? String(error.message) : undefined} />
    </>
  );
};
