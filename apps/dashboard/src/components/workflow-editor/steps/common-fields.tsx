import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { CopyButton } from '../../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../primitives/form/form';
import { Input, InputField } from '../../primitives/input';
import { useStep } from './use-step';

export function CommonFields() {
  const { stepIndex, control } = useStep();
  const { isReadOnly } = useWorkflowEditorContext();

  return (
    <>
      <FormField
        control={control}
        name={`steps.${stepIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Step Name</FormLabel>
            <FormControl>
              <InputField>
                <Input placeholder="Untitled" {...field} disabled={isReadOnly} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`steps.${stepIndex}.stepId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Step Identifier</FormLabel>
            <FormControl>
              <InputField className="flex overflow-hidden pr-0">
                <Input placeholder="Untitled" {...field} readOnly disabled={isReadOnly} />
                <CopyButton
                  content={field.value}
                  className="rounded-md rounded-s-none border-b-0 border-r-0 border-t-0 text-neutral-400"
                />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
