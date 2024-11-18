import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
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
        <InputField state={errors[subjectKey] ? 'error' : 'default'}>
          <FormItem className="w-full">
            <FormControl>
              <Editor
                fontFamily="inherit"
                placeholder={capitalize(field.name)}
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
            </FormControl>
            <FormMessage />
          </FormItem>
        </InputField>
      )}
    />
  );
};
