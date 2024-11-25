import { useMemo } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { completions } from '@/utils/liquid-autocomplete';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { JSON_SCHEMA_FORM_ID_DELIMITER } from './template-utils';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, disabled, id, required } = props;
  const { control } = useFormContext();

  const extractedName = useMemo(() => id.split(JSON_SCHEMA_FORM_ID_DELIMITER).join('.').slice(5), [id]);
  const isNumberType = useMemo(() => props.schema.type === 'number', [props.schema.type]);

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
                    const isNaN = Number.isNaN(val);
                    const finalValue = isNaN ? undefined : val;
                    field.onChange(finalValue);
                  }}
                  required={required}
                  readOnly={readonly}
                  disabled={disabled}
                  placeholder={capitalize(label)}
                />
              ) : (
                <Editor
                  fontFamily="inherit"
                  placeholder={capitalize(label)}
                  id={label}
                  extensions={[autocompletion({ override: [completions([])] })]}
                  readOnly={readonly || disabled}
                  {...field}
                />
              )}
            </InputField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
