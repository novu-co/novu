import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { FieldEditor } from '@/components/primitives/field-editor';

const subjectKey = 'subject';

export const EmailSubject = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <FieldEditor
              id={field.name}
              value={field.value}
              onChange={field.onChange}
              variables={variables}
              placeholder={capitalize(field.name)}
              autoFocus={!field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
