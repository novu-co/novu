import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input, InputFieldProps, InputFieldPure, InputProps } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { completions } from '@/utils/liquid-autocomplete';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { autocompletion } from '@codemirror/autocomplete';

type URLInputProps = Omit<InputProps, 'value' | 'onChange' | 'size'> & {
  options: string[];
  asEditor?: boolean;
  withHint?: boolean;
  fields: {
    urlKey: string;
    targetKey: string;
  };
  variables: LiquidVariable[];
} & Pick<InputFieldProps, 'size'>;

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
  const extensions = useMemo(() => [autocompletion({ override: [completions(variables)] })], [variables]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between space-x-2">
        <div className="relative w-full">
          <InputFieldPure className="pr-0">
            <FormField
              control={control}
              name={urlKey}
              render={({ field }) => (
                <FormItem className="min-w-px max-w-full basis-full">
                  <FormControl>
                    {asEditor ? (
                      <Editor
                        singleLine
                        indentWithTab={false}
                        basicSetup={{
                          defaultKeymap: false,
                        }}
                        fontFamily="inherit"
                        placeholder={placeholder}
                        extensions={extensions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    ) : (
                      <Input type="text" className="min-w-[20ch]" placeholder={placeholder} {...field} />
                    )}
                  </FormControl>
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
                      <SelectTrigger className="h-full max-w-24 rounded-l-none border-0 border-l">
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
        </div>
      </div>
      <FormMessagePure error={error ? String(error.message) : undefined}>
        {withHint && 'Type {{ for variables'}
      </FormMessagePure>
    </div>
  );
};
