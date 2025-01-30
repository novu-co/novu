import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Code2 } from '@/components/icons/code-2';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { VariableSelectBlank } from '../../../conditions-editor/variable-select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { InputRoot, InputWrapper } from '../../../primitives/input';

export const DigestKey = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name="controlValues.digestKey"
      render={({ field }) => (
        <FormItem className="flex w-full flex-col">
          <>
            <FormLabel tooltip="Digest is aggregated by the subscriberId by default. You can add one more aggregation key to group events further.">
              Group events by
            </FormLabel>
            <InputRoot>
              <InputWrapper className="flex h-[28px] items-center gap-1 border-r border-neutral-100 pr-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FormLabel className="flex h-full items-center gap-1 border-r border-neutral-100 pr-1">
                      <Code2 className="text-feature size-3 min-w-3" />
                      <span className="text-foreground-600 text-xs font-normal">subscriberId</span>
                    </FormLabel>
                  </TooltipTrigger>
                  <TooltipContent>This is default key!</TooltipContent>
                </Tooltip>
                <VariableSelectBlank
                  value={field.value}
                  onChange={field.onChange}
                  options={variables.map((variable) => ({
                    label: variable.label,
                    value: variable.label,
                  }))}
                  placeholder="Add additional digest..."
                  leftIcon={<Code2 className="text-feature size-3 min-w-3" />}
                />
              </InputWrapper>
            </InputRoot>
            <FormMessage />
          </>
        </FormItem>
      )}
    />
  );
};
