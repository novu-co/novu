import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { completions } from '@/utils/liquid-autocomplete';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';

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
            <InputField className="px-1" state={errors[name] ? 'error' : 'default'}>
              <Editor
                fontFamily="inherit"
                placeholder={capitalize(label)}
                id={label}
                extensions={[autocompletion({ override: [completions([])] })]}
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
