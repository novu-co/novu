import { ComponentProps, useState } from 'react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { RiArrowDownSLine, RiArrowUpSLine, RiInputField, RiQuestionLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { RJSFSchema } from '@rjsf/utils';
import { type ControlsMetadata } from '@novu/shared';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/primitives/collapsible';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import { Switch } from '@/components/primitives/switch';
import { WorkflowOriginEnum } from '@/utils/enums';
import { cn } from '@/utils/ui';
import { JsonForm } from './json-form';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { useWorkflow } from '../../workflow-provider';
import { buildDefaultValuesOfDataSchema } from '@/utils/schema';

type CustomStepControlsProps = ComponentProps<typeof Collapsible> & {
  dataSchema: ControlsMetadata['dataSchema'];
  origin: WorkflowOriginEnum;
};
export const CustomStepControls = (props: CustomStepControlsProps) => {
  const { className, dataSchema, origin, ...rest } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const { step } = useWorkflow();
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(() => Object.keys(step?.controls.values ?? {}).length > 0);
  const { reset, setValue, trigger } = useFormContext();
  const { saveForm } = useSaveForm();
  const overrideForm = useForm({ defaultValues: { override: false } });

  if (!dataSchema?.properties || origin !== WorkflowOriginEnum.EXTERNAL) {
    return null;
  }

  return (
    <>
      {/* This doesn't needs to be a form, but using it as a form allows to re-use the formItem designs without duplicating the same styles */}
      <Switch
        checked={isOverrideEnabled}
        onCheckedChange={async (checked) => {
          setIsOverrideEnabled(checked);
          if (!checked) {
            reset(buildDefaultValuesOfDataSchema(step?.controls.dataSchema ?? {}));
            await trigger();
            saveForm();
          }
        }}
      />
      <Form {...overrideForm}>
        <form id="override-controls-form">
          <FormField
            control={overrideForm.control}
            name="override"
            render={({ field }) => (
              <FormItem className="mb-6 mt-2 flex w-full items-center justify-between">
                <div>
                  <FormLabel className="block">Override code defined defaults</FormLabel>
                  <span className="text-xs text-neutral-400">
                    Code-defined defaults are read-only by default, you can override them using this toggle.
                  </span>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        setValue('controlValues', null);
                        saveForm();
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

      <Separator className="mb-3" />
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
            <JsonForm schema={(dataSchema as RJSFSchema) || {}} disabled={!isOverrideEnabled} />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Link
        target="_blank"
        to="https://docs.novu.co/concepts/controls"
        className="mt-1 flex items-center gap-1 text-xs text-neutral-600 hover:underline"
      >
        <RiQuestionLine className="size-4" /> Learn more about code-defined controls.
      </Link>
    </>
  );
};
