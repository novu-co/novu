import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/primitives/form/form';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { InputRoot, InputWrapper } from '../../../primitives/input';

const bodyKey = 'body';

const basicSetup = {
  defaultKeymap: true,
};

export const InAppBody = () => {
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
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputRoot hasError={!!fieldState.error}>
              <InputWrapper className="h-36 px-1">
                <Editor
                  fontFamily="inherit"
                  indentWithTab={false}
                  placeholder={capitalize(field.name)}
                  id={field.name}
                  extensions={extensions}
                  basicSetup={basicSetup}
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  height="100%"
                />
              </InputWrapper>
            </InputRoot>
          </FormControl>
          <FormMessage>{`Type {{ for variables, or wrap text in ** for bold.`}</FormMessage>
        </FormItem>
      )}
    />
  );
};
