import { useFormContext } from 'react-hook-form';

import { ControlInput } from '@/components/primitives/control-input';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input, InputProps, InputRoot, InputWrapper } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';

type URLInputProps = Omit<InputProps, 'value' | 'onChange'> & {
  options: string[];
  asEditor?: boolean;
  withHint?: boolean;
  fields: {
    urlKey: string;
    targetKey: string;
  };
  variables: LiquidVariable[];
};

export const URLInput = ({
  options,
  asEditor = false,
  placeholder,
  fields: { urlKey, targetKey },
  withHint = true,
  variables = [],
}: URLInputProps) => {
  const { control, getFieldState } = useFormContext();
  const { saveForm } = useSaveForm();
  const url = getFieldState(`${urlKey}`);
  const target = getFieldState(`${targetKey}`);
  const error = url.error || target.error;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex w-full">
          <FormField
            control={control}
            name={urlKey}
            render={({ field }) => (
              <FormItem className="min-w-px max-w-full basis-full">
                {asEditor ? (
                  <InputRoot className="overflow-visible rounded-r-none">
                    <InputWrapper className="flex h-9 items-center border-r-0 p-2.5">
                      <ControlInput
                        multiline={false}
                        indentWithTab={false}
                        placeholder={placeholder}
                        value={field.value}
                        onChange={field.onChange}
                        variables={variables}
                      />
                    </InputWrapper>
                  </InputRoot>
                ) : (
                  <Input type="text" className="min-w-[20ch]" placeholder={placeholder} {...field} />
                )}
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={targetKey}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      saveForm();
                    }}
                  >
                    <SelectTrigger className="border-1 h-[36px] max-w-24 rounded-l-none border-l-0">
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
        </div>
      </div>
      <FormMessagePure error={error ? String(error.message) : undefined}>
        {withHint && 'Type {{ for variables'}
      </FormMessagePure>
    </div>
  );
};
