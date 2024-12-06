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
};

export const AmountInput = ({
  fields,
  options,
  defaultOption,
  className,
  placeholder,
  isReadOnly,
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
      <InputFieldPure className="h-7 rounded-lg border pr-0">
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
