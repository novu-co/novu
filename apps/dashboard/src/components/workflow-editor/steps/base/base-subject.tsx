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

const subjectKey = 'subject';

export const BaseSubject = () => {
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
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormControl>
            <InputRoot hasError={!!fieldState.error}>
              <InputWrapper className="flex h-9 items-center justify-center px-1">
                <Editor
                  singleLine
                  indentWithTab={false}
                  fontFamily="inherit"
                  placeholder={capitalize(field.name)}
                  id={field.name}
                  extensions={extensions}
                  value={field.value}
                  onChange={field.onChange}
                  className="flex h-full items-center"
                />
              </InputWrapper>
            </InputRoot>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
