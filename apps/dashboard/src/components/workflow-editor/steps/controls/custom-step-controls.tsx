import { ComponentProps, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { RiArrowDownSLine, RiArrowUpSLine, RiInputField } from 'react-icons/ri';
import { Form } from 'react-router-dom';
import { RJSFSchema } from '@rjsf/utils';
import { type ControlsMetadata } from '@novu/shared';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import { Switch } from '@/components/primitives/switch';
import { WorkflowOriginEnum } from '@/utils/enums';
import { cn } from '@/utils/ui';
import { JsonForm } from './json-form';

type CustomStepControlsProps = ComponentProps<typeof Collapsible> & {
  dataSchema: ControlsMetadata['dataSchema'];
  origin: WorkflowOriginEnum;
};
export const CustomStepControls = (props: CustomStepControlsProps) => {
  const { className, dataSchema, origin, ...rest } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(true);

  const overrideForm = useForm({
    defaultValues: {
      override: false,
    },
  });

  const { override } = useWatch(overrideForm);

  if (!dataSchema?.properties || origin !== WorkflowOriginEnum.EXTERNAL) {
    return null;
  }

  return (
    <>
      {/* This doesn't needs to be a form, but using it as a form allows to re-use the formItem designs without duplicating the same styles */}
      <Form {...overrideForm}>
        <form id="override-controls-form">
          <FormField
            control={overrideForm.control}
            name="override"
            render={({ field }) => (
              <FormItem className="mb-4 mt-2 flex w-full items-center justify-between">
                <FormLabel
                  hint="Code-defined defaults are read-only by default, you can override them using this toggle."
                  className="block"
                >
                  Override code defined defaults
                </FormLabel>

                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        // updateUserPreference(null);
                      }
                      // track(TelemetryEvent.WORKFLOW_PREFERENCES_OVERRIDE_USED, {
                      //   new_status: checked,
                      // });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Separator className="my-3" />
      <Collapsible
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        className={cn(
          'bg-neutral-alpha-50 border-neutral-alpha-200 flex w-full flex-col gap-2 rounded-lg border p-2 text-sm',
          className
        )}
        {...rest}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <RiInputField className="text-feature size-5" />
            <span className="text-sm font-medium">Custom step controls</span>
          </div>

          {isEditorOpen ? (
            <RiArrowUpSLine className="text-neutral-alpha-400 size-5" />
          ) : (
            <RiArrowDownSLine className="text-neutral-alpha-400 size-5" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-background rounded-md border border-dashed p-3">
            <JsonForm schema={(dataSchema as RJSFSchema) || {}} disabled={!override} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
