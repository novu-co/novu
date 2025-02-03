import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Code2 } from '@/components/icons/code-2';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { VariableSelectBlank } from '../../../conditions-editor/variable-select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { InputRoot, InputWrapper } from '../../../primitives/input';
import { StaticVariablePill } from '../../../primitives/control-input/variable-plugin/static-variable-pill';
import { useFormAutosave } from '../../../../hooks/use-form-autosave';
import { WorkflowResponseDto } from '@novu/shared';

function parseLiquidVariables(value: string): string[] {
  const matches = value.match(/{{(.*?)}}/g) || [];
  return matches.map((match) => match.replace(/[{}]/g, '').trim());
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
    <path
      d="M6.77396 5.36422L9.00146 3.13672L9.63776 3.77302L7.41026 6.00052L9.63776 8.22802L9.00146 8.86432L6.77396 6.63682L4.54646 8.86432L3.91016 8.22802L6.13766 6.00052L3.91016 3.77302L4.54646 3.13672L6.77396 5.36422Z"
      fill="#99A0AE"
    />
  </svg>
);

export const DigestKey = () => {
  const { workflow, update } = useWorkflow();
  const form = useFormContext();

  const { saveForm } = useFormAutosave({
    previousData: workflow as WorkflowResponseDto,
    form: form,
    save: update,
  });
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={form.control}
      name="controlValues.digestKey"
      render={({ field }) => {
        const handleRemoveVariable = (variableToRemove: string) => {
          field.onChange(field.value.replace(`{{${variableToRemove}}}`, ''));
          saveForm();
        };

        return (
          <FormItem className="flex w-full flex-col">
            <>
              <FormLabel tooltip="Digest is aggregated by the subscriberId by default. You can add one more aggregation key to group events further.">
                Group events by
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex">
                      <StaticVariablePill>subscriberId</StaticVariablePill>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>This is default key!</TooltipContent>
                </Tooltip>
                {parseLiquidVariables(field.value as string).map((variable, index) => (
                  <div key={index} className="flex items-center">
                    <StaticVariablePill>
                      <span className="flex items-center">
                        {variable}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariable(variable)}
                          className="ml-1 flex items-center hover:opacity-80"
                        >
                          <CloseIcon />
                        </button>
                      </span>
                    </StaticVariablePill>
                  </div>
                ))}
              </div>
              <InputRoot>
                <InputWrapper className="flex h-[28px] items-center gap-1 border-r border-neutral-100 pr-1">
                  <VariableSelectBlank
                    onSelect={() => {
                      saveForm();
                    }}
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
        );
      }}
    />
  );
};
