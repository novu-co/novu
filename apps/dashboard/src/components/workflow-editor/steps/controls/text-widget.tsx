import { type WidgetProps } from '@rjsf/utils';
import { EditorView } from '@uiw/react-codemirror';
import { liquid } from '@codemirror/lang-liquid';
import { useFormContext } from 'react-hook-form';
import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { capitalize } from '@/utils/string';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, name } = props;

  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="my-2 w-full py-1">
          <FormLabel>{capitalize(label)}</FormLabel>
          <FormControl>
            <InputField size="md" className="px-1" state={errors[name] ? 'error' : 'default'}>
              <Editor
                placeholder={capitalize(label)}
                size="md"
                id={label}
                extensions={[
                  liquid({
                    variables: [{ type: 'variable', label: 'asdf' }],
                  }),
                  EditorView.lineWrapping,
                ]}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                readOnly={readonly}
              />
            </InputField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
