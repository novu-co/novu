import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';
import { useFormContext } from 'react-hook-form';

import { Input, InputField, InputFieldProps, InputProps } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessagePure } from '@/components/primitives/form/form';
import { cn } from '@/utils/ui';

type URLInputProps = Omit<InputProps, 'value' | 'onChange' | 'size'> & {
  options: string[];
  asEditor?: boolean;
  withHint?: boolean;
  fields: {
    urlKey: string;
    targetKey: string;
  };
} & Pick<InputFieldProps, 'size'>;

export const URLInput = ({
  options,
  size = 'default',
  asEditor = false,
  placeholder,
  fields: { urlKey, targetKey },
  withHint = true,
}: URLInputProps) => {
  const { control, getFieldState } = useFormContext();
  const url = getFieldState(`${urlKey}`);
  const target = getFieldState(`${targetKey}`);
  const error = url.error || target.error;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between space-x-2">
        <div className="relative flex-grow">
          <InputField className="pr-0" size={size}>
            <FormField
              control={control}
              name={urlKey}
              defaultValue=""
              render={({ field }) => (
                <FormItem className={cn('w-full', { 'h-[38px]': size === 'md', 'h-[30px]': size !== 'md' })}>
                  <FormControl>
                    {asEditor ? (
                      <Editor
                        size={size}
                        placeholder={placeholder}
                        height={size === 'md' ? '38px' : '30px'}
                        extensions={[
                          liquid({
                            variables: [{ type: 'variable', label: 'asdf' }],
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
                      <SelectTrigger
                        className={cn('max-w-24 rounded-l-none border-0 border-l', {
                          'h-[38px]': size === 'md',
                          'h-[30px]': size !== 'md',
                        })}
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
          </InputField>
        </div>
      </div>
      <FormMessagePure error={error ? String(error.message) : undefined}>
        {withHint && 'This support variables and relative URLs i.e /tasks/{{taskId}}'}
      </FormMessagePure>
    </div>
  );
};
