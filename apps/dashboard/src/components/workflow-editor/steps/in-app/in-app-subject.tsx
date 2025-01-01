import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';

const subjectKey = 'subject';

export const InAppSubject = () => {
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);
  const extensions = useMemo(
    () => [autocompletion({ override: [completions(variables)] }), EditorView.lineWrapping],
    [variables]
  );

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => (
        <InputField size="fit">
          <FormItem className="w-full">
            <FormControl>
              <Editor
                fontFamily="inherit"
                singleLine
                indentWithTab={false}
                placeholder={capitalize(field.name)}
                id={field.name}
                extensions={extensions}
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </InputField>
      )}
    />
  );
};
