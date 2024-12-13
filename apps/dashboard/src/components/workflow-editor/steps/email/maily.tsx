import { FormControl, FormField, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
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
  const { step } = useWorkflow();
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
            <div className={cn('mx-auto flex h-full w-full', className)} {...rest}>
              <FormControl>
                <Editor
                  config={{
                    hasMenuBar: false,
                    wrapClassName: 'h-full ',
                    bodyClassName: '!bg-transparent h-full !border-none !mt-0 [&>div]:h-full [&_.tiptap]:h-full',
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
