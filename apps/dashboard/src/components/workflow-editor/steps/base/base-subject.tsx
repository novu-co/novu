import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { ControlInput } from '@/components/primitives/control-input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { InputRoot, InputWrapper } from '../../../primitives/input';

const subjectKey = 'subject';

export const BaseSubject = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputRoot hasError={!!fieldState.error}>
              <InputWrapper className="h-9 p-2.5">
                <ControlInput
                  multiline={false}
                  indentWithTab={false}
                  placeholder={capitalize(field.name)}
                  id={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  variables={variables}
                />
              </InputWrapper>
            </InputRoot>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
