import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { Editor } from '@/components/primitives/editor';
import { capitalize } from '@/utils/string';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { useStepEditorContext } from '../hooks';

const subjectKey = 'subject';

export const InAppSubject = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { step } = useStepEditorContext();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <FormField
      control={control}
      name={subjectKey}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputField size="md" className="px-1" state={errors[subjectKey] ? 'error' : 'default'}>
              <Editor
                placeholder={capitalize(field.name)}
                size="md"
                id={field.name}
                extensions={[
                  liquid({
                    variables,
                  }),
                  EditorView.lineWrapping,
                ]}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            </InputField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
