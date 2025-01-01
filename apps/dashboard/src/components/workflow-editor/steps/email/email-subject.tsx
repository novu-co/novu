import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { FieldEditor } from '@/components/primitives/field-editor';
import { autocompletion } from '@codemirror/autocomplete';

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
        <>
          <FormItem className="w-full">
            <FormControl>
              <FieldEditor
                size="lg"
                singleLine
                indentWithTab={false}
                autoFocus={!field.value}
                fontFamily="inherit"
                placeholder={capitalize(field.name)}
                id={field.name}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </>
      )}
    />
  );
};
