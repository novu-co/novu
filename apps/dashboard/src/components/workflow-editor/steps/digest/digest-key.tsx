import { autocompletion } from '@codemirror/autocomplete';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Code2 } from '@/components/icons/code-2';
import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { InputFieldPure } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';

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
            <FormLabel tooltip="Digest is aggregated by the subscriberId by default. You can add one more aggregation key to group events further.">
              Aggregated by
            </FormLabel>
            <InputFieldPure className="h-7 items-center gap-0 rounded-lg border">
              <FormLabel className="flex h-full items-center gap-1 border-r border-neutral-100 pr-1">
                <Code2 className="-ml-1.5 size-5" />
                <span className="text-foreground-600 text-xs font-normal">subscriberId</span>
              </FormLabel>
              <FormControl>
                <Editor
                  singleLine
                  indentWithTab={false}
                  fontFamily="inherit"
                  ref={field.ref}
                  placeholder="Add additional digest..."
                  className="overflow-x-auto [&_.cm-line]:mt-px"
                  id={field.name}
                  extensions={extensions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </InputFieldPure>
            <FormMessage />
          </>
        </FormItem>
      )}
    />
  );
};
