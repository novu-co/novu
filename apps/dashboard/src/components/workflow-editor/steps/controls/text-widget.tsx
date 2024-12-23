import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { type WidgetProps } from '@rjsf/utils';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { getFieldName } from './template-utils';
import { FieldEditor } from '@/components/primitives/field-editor';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, disabled, id, required } = props;
  const { control } = useFormContext();
  const { step } = useWorkflow();
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
                <FieldEditor
                  fontFamily="inherit"
                  placeholder={capitalize(label)}
                  id={label}
                  value={field.value}
                  onChange={field.onChange}
                  variables={variables}
                  size="default"
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
