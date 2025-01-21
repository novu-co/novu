import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { ControlInput } from '@/components/primitives/control-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { InputRoot, InputWrapper } from '../../../primitives/input';

const bodyKey = 'body';

export const BaseBody = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={bodyKey}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputRoot hasError={!!fieldState.error}>
              <InputWrapper className="h-36 items-start p-3 py-2">
                <ControlInput
                  placeholder={capitalize(field.name)}
                  id={field.name}
                  variables={variables}
                  value={field.value}
                  multiline
                  onChange={field.onChange}
                />
              </InputWrapper>
            </InputRoot>
          </FormControl>
          <FormMessage>{`You can use variables by typing {{ select from the list or create a new one.`}</FormMessage>
        </FormItem>
      )}
    />
  );
};
