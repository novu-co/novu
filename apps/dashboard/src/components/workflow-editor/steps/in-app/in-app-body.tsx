import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { useFetchStep } from '@/hooks/use-fetch-step';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { useParams } from 'react-router-dom';

const bodyKey = 'body';

export const InAppBody = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { workflowSlug = '', stepSlug = '' } = useParams<{ workflowSlug: string; stepSlug: string }>();

  const { step } = useFetchStep({ workflowSlug, stepSlug });

  return (
    <FormField
      control={control}
      name={bodyKey}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputField size="md" className="h-32 px-1" state={errors[bodyKey] ? 'error' : 'default'}>
              <Editor
                placeholder={capitalize(field.name)}
                size="md"
                id={field.name}
                extensions={[
                  liquid({
                    variables: step ? parseStepVariablesToLiquidVariables(step.variables) : [],
                  }),
                  EditorView.lineWrapping,
                ]}
                ref={field.ref}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                height="100%"
              />
            </InputField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
