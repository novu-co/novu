import { ComponentProps, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { RiArrowDownSLine, RiArrowUpSLine, RiInputField, RiQuestionLine } from 'react-icons/ri';
import { motion } from 'motion/react';
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
import { SidebarContent } from '@/components/side-navigation/sidebar';

type CustomStepControlsProps = ComponentProps<typeof Collapsible> & {
  dataSchema: ControlsMetadata['dataSchema'];
  origin: WorkflowOriginEnum;
};
export const CustomStepControls = (props: CustomStepControlsProps) => {
  const { className, dataSchema, origin, ...rest } = props;
  const [isEditorOpen, setIsEditorOpen] = useState(true);
  const { step } = useWorkflow();
  const { reset } = useFormContext();
  const { saveForm } = useSaveForm();
  const overrideForm = useForm({ defaultValues: { override: Object.keys(step?.controls.values ?? {}).length > 0 } });

  if (!dataSchema?.properties || origin !== WorkflowOriginEnum.EXTERNAL) {
    return (
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
            <span className="text-sm font-medium">Code-defined step controls</span>
          </div>

          {isEditorOpen ? (
            <RiArrowUpSLine className="text-neutral-alpha-400 size-5" />
          ) : (
            <RiArrowDownSLine className="text-neutral-alpha-400 size-5" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-background rounded-md border border-dashed p-3">
            <div className="flex flex-row items-center justify-center gap-6"></div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <>
      <SidebarContent size="md">
        <Form {...overrideForm}>
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
                        const defaultValues = buildDefaultValuesOfDataSchema(step?.controls.dataSchema ?? {});
                        reset(defaultValues);
                        saveForm(true);
                      }
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </SidebarContent>
      <Separator className="mb-3" />
      <SidebarContent size="md">
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
              <span className="text-sm font-medium">Code-fe step controls</span>
            </div>

            {isEditorOpen ? (
              <RiArrowUpSLine className="text-neutral-alpha-400 size-5" />
            ) : (
              <RiArrowDownSLine className="text-neutral-alpha-400 size-5" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="bg-background rounded-md border border-dashed p-3">
              <JsonForm schema={(dataSchema as RJSFSchema) || {}} disabled={!overrideForm.watch().override} />
            </div>
          </CollapsibleContent>
        </Collapsible>
        <OverrideMessage isOverridden={overrideForm.watch().override} />
      </SidebarContent>
    </>
  );
};

const OverrideMessage = ({ isOverridden }: { isOverridden: boolean }) => {
  const fadeAnimation = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.1 },
  };

  return (
    <motion.div layout {...fadeAnimation} className="relative min-h-10">
      {isOverridden ? (
        <div className="mt-5 flex w-full items-center gap-3 rounded-md border bg-neutral-50 px-3 py-2.5">
          <span className="w-1 self-stretch rounded-full bg-neutral-500" />
          <span className="flex-1 text-xs font-medium text-neutral-600">
            Custom controls defined in code have been overridden. Disable overrides to restore original.
          </span>
        </div>
      ) : (
        <Link
          target="_blank"
          to="https://docs.novu.co/concepts/controls"
          className="mt-2 flex items-center gap-1 text-xs text-neutral-600 hover:underline"
        >
          <RiQuestionLine className="size-4" /> Learn more about code-defined controls.
        </Link>
      )}
    </motion.div>
  );
};
