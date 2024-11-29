import { useMemo } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { EditorView } from '@uiw/react-codemirror';
import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { completions } from '@/utils/liquid-autocomplete';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { getFieldName } from './template-utils';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { useStep } from '../step-provider';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, disabled, id, required } = props;
  const { control } = useFormContext();
  const { step } = useStep();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  const extractedName = useMemo(() => getFieldName(id), [id]);
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
                    if (e.target.value === '') {
                      field.onChange(undefined);
                      return;
                    }
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
                  extensions={[autocompletion({ override: [completions(variables)] }), EditorView.lineWrapping]}
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
