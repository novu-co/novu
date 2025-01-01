import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { FieldEditor } from '@/components/primitives/field-editor';

const subjectKey = 'subject';

export const InAppSubject = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => (
        <InputField size="fit">
          <FormItem className="w-full">
            <FormControl>
              <FieldEditor
                fontFamily="inherit"
                singleLine
                indentWithTab={false}
                placeholder={capitalize(field.name)}
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                variables={variables}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </InputField>
      )}
    />
  );
};
