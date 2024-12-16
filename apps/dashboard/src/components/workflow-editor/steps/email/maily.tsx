import { FormControl, FormField, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { cn } from '@/utils/ui';
import { Editor } from '@maily-to/core';
import {
  blockquote,
  bulletList,
  button,
  columns,
  divider,
  forLoop,
  hardBreak,
  heading1,
  heading2,
  heading3,
  image,
  orderedList,
  section,
  spacer,
  text,
} from '@maily-to/core/blocks';
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
                    wrapClassName: 'h-full w-full',
                    bodyClassName: '!bg-transparent h-full !border-none !mt-0 [&>div]:h-full [&_.tiptap]:h-full',
                  }}
                  blocks={[
                    text,
                    heading1,
                    heading2,
                    heading3,
                    bulletList,
                    orderedList,
                    image,
                    section,
                    columns,
                    forLoop,
                    divider,
                    spacer,
                    button,
                    hardBreak,
                    blockquote,
                  ]}
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
