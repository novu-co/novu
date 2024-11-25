import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { completions } from '@/utils/liquid-autocomplete';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { JSON_SCHEMA_FORM_ID_DELIMITER } from './json-form';
import { DevTool } from '@hookform/devtools';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, disabled, id } = props;
  const { control } = useFormContext();

  const extractedName = id.split(JSON_SCHEMA_FORM_ID_DELIMITER).join('.').slice(5);

  const isNumberType = props.schema.type === 'number';

  return (
    <FormField
      control={control}
      name={extractedName}
      render={({ field }) => (
        <FormItem className="w-full py-1">
          <FormLabel className="text-xs">{capitalize(label)}</FormLabel>
          <FormControl>
            <InputField size="fit" className="w-full">
              {isNumberType ? (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    field.onChange(val);
                  }}
                />
              ) : (
                <Editor
                  fontFamily="inherit"
                  placeholder={capitalize(label)}
                  id={label}
                  extensions={[autocompletion({ override: [completions([])] })]}
                  value={field.value}
                  onChange={field.onChange}
                  readOnly={readonly || disabled}
                />
              )}
            </InputField>
          </FormControl>
          <FormMessage />
          <DevTool control={control} />
        </FormItem>
      )}
    />
  );
}
