import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { FieldEditor } from '@/components/primitives/field-editor';
import { InputField } from '../../../primitives/input';

const bodyKey = 'body';

export const InAppBody = () => {
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
            <InputField className="flex h-36 items-start">
              <FieldEditor
                fontFamily="inherit"
                indentWithTab={false}
                placeholder={capitalize(field.name)}
                id={field.name}
                value={field.value}
                onChange={field.onChange}
                variables={variables}
                size="lg"
                autoFocus
              />
            </InputField>
          </FormControl>
          <FormMessage>{`Type {{ for variables, or wrap text in ** for bold.`}</FormMessage>
        </FormItem>
      )}
    />
  );
};
