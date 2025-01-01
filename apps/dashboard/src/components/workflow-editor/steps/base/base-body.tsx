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

const bodyKey = 'body';

const basicSetup = {
  defaultKeymap: true,
};

export const BaseBody = () => {
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
      name={bodyKey}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputField className="h-36 px-1">
              <Editor
                indentWithTab={false}
                fontFamily="inherit"
                placeholder={capitalize(field.name)}
                id={field.name}
                extensions={extensions}
                basicSetup={basicSetup}
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
                height="100%"
              />
            </InputField>
          </FormControl>
          <FormMessage>{`You can use variables by typing {{ select from the list or create a new one.`}</FormMessage>
        </FormItem>
      )}
    />
  );
};
