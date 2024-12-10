import { FormControl, FormField, FormMessage } from '@/components/primitives/form/form';
import { useStep } from '@/components/workflow-editor/steps/step-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { cn } from '@/utils/ui';
import { Editor } from '@maily-to/core';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { HTMLAttributes, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const bodyKey = 'emailEditor';

type MailyProps = HTMLAttributes<HTMLDivElement>;
export const Maily = (props: MailyProps) => {
  const { className, ...rest } = props;
  const { step } = useStep();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);
  const [_, setEditor] = useState<TiptapEditor>();
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={bodyKey}
      render={({ field }) => {
        return (
          <>
            <div className={cn('mx-auto w-full pl-4', className)} {...rest}>
              <FormControl>
                <Editor
                  config={{
                    hasMenuBar: false,
                    bodyClassName: '!bg-transparent !border-none !mt-0',
                  }}
                  triggerSuggestionCharacter="{{"
                  variables={variables.map((v) => ({ name: v.label, required: false }))}
                  contentJson={field.value ? JSON.parse(field.value) : undefined}
                  onCreate={setEditor}
                  onUpdate={(editor) => {
                    setEditor(editor);
                    field.onChange(JSON.stringify(editor.getJSON()));
                  }}
                />
              </FormControl>
            </div>
            <FormMessage />
          </>
        );
      }}
    />
  );
};
