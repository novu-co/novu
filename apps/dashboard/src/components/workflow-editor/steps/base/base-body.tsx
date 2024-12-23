import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { FieldEditor } from '@/components/primitives/field-editor';

const bodyKey = 'body';

export const BaseBody = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={bodyKey}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputField className="flex h-36 items-start px-1">
              <FieldEditor
                fontFamily="inherit"
                placeholder={capitalize(field.name)}
                id={field.name}
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                variables={variables}
                size="default"
              />
            </InputField>
          </FormControl>
          <FormMessage>{`This supports markdown and variables, type {{ for more.`}</FormMessage>
        </FormItem>
      )}
    />
  );
};
