import { autocompletion } from '@codemirror/autocomplete';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Code2 } from '@/components/icons/code-2';
import { Editor } from '@/components/primitives/editor';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { InputRoot, InputWrapper } from '../../../primitives/input';

export const DigestKey = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);
  const extensions = useMemo(() => [autocompletion({ override: [completions(variables)] })], [variables]);

  return (
    <FormField
      control={control}
      name="controlValues.digestKey"
      render={({ field }) => (
        <FormItem className="flex w-full flex-col overflow-hidden">
          <>
            <FormLabel
              optional
              tooltip="Digest is aggregated by the subscriberId by default. You can add one more aggregation key to group events further."
            >
              Aggregated by
            </FormLabel>
            <InputRoot>
              <InputWrapper className="flex h-[28px] items-center gap-1 border-r border-neutral-100 pr-1">
                <FormLabel className="flex h-full items-center gap-1 border-r border-neutral-100 pr-1">
                  <Code2 className="-ml-1.5 size-5" />
                  <span className="text-foreground-600 text-xs font-normal">subscriberId</span>
                </FormLabel>
                <Editor
                  className="overflow-x-auto font-medium [&_.cm-line]:mt-px"
                  singleLine
                  indentWithTab={false}
                  fontFamily="inherit"
                  ref={field.ref}
                  placeholder="Add additional digest..."
                  id={field.name}
                  extensions={extensions}
                  value={field.value}
                  onChange={field.onChange}
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
