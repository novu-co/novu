import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { Input, InputField, InputFieldProps, InputProps } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';

type URLInputProps = Omit<InputProps, 'value' | 'onChange' | 'size'> & {
  options: string[];
  asEditor?: boolean;
  withHint?: boolean;
  fields: {
    urlKey: string;
    targetKey: string;
  };
  variables: Array<{ type: string; label: string }>;
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
  const url = getFieldState(`${urlKey}`);
  const target = getFieldState(`${targetKey}`);
  const error = url.error || target.error;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between space-x-2">
        <div className="relative flex-grow">
          <InputField className="pr-0">
            <FormField
              control={control}
              name={urlKey}
              defaultValue=""
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    {asEditor ? (
                      <Editor
                        fontFamily="inherit"
                        placeholder={placeholder}
                        extensions={[
                          liquid({
                            variables,
                          }),
                          EditorView.lineWrapping,
                        ]}
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
              defaultValue="_self"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="max-w-24 rounded-l-none border-0 border-l">
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
          </InputField>
        </div>
      </div>
      <FormMessagePure error={error ? String(error.message) : undefined}>
        {withHint && 'This supports variables and relative URLs i.e /tasks/{{taskId}}'}
      </FormMessagePure>
    </div>
  );
};
