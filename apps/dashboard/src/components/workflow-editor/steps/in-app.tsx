import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { Button } from '../../primitives/button';
import { CopyButton } from '../../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../primitives/form/form';
import { Input, InputField } from '../../primitives/input';
import { Separator } from '../../primitives/separator';
import { useStep } from './use-step';

export function InApp() {
  const { stepIndex, control } = useStep();

  return (
    <>
      <div className="flex flex-col gap-4 p-3">
        <FormField
          control={control}
          name={`steps.${stepIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Step Name</FormLabel>
              <FormControl>
                <InputField>
                  <Input placeholder="Untitled" {...field} />
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
                  <Input placeholder="Untitled" {...field} />
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
      </div>
      <Separator />
      <div className="px-3 py-4">
        <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
          <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
          Configure in-app template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
        </Button>
      </div>
    </>
  );
}
