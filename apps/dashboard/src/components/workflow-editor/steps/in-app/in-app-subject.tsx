import { useMemo } from 'react';
import { EditorView } from '@uiw/react-codemirror';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { useStep } from '@/components/workflow-editor/steps/step-provider';

const subjectKey = 'subject';

export const InAppSubject = () => {
  const { control } = useFormContext();
  const { step } = useStep();
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
