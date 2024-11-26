import { Separator } from '@/components/primitives/separator';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { CommonFields } from '@/components/workflow-editor/steps/common-fields';
import { useBlocker, useParams } from 'react-router-dom';
import { flattenIssues } from '@/components/workflow-editor/step-utils';
import { useCallback, useEffect, useMemo } from 'react';
import { useStepEditorContext } from '@/components/workflow-editor/steps/hooks';
import { buildDefaultValues, buildDynamicZodSchema } from '@/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/primitives/form/form';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import debounce from 'lodash.debounce';
import { z } from 'zod';
import { TimeUnitEnum } from '@novu/shared';
import { useUpdateWorkflow } from '@/hooks/use-update-workflow';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { UnsavedChangesAlertDialog } from '@/components/unsaved-changes-alert-dialog';
import merge from 'lodash.merge';
import { DelayAmount } from '@/components/workflow-editor/steps/delay/delay-amount';

const TOAST_CONFIG = {
  position: 'bottom-left' as const,
  classNames: { toast: 'ml-10 mb-4' },
};

const delayControlsSchema = z
  .object({
    type: z.enum(['regular']).default('regular'),
    amount: z.number(),
    unit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export const DelayConfigure = () => {
  const { stepSlug = '' } = useParams<{ workflowSlug: string; stepSlug: string }>();
  const { step, refetch } = useStepEditorContext();
  const { workflow, isReadOnly } = useWorkflowEditorContext();
  const { uiSchema, dataSchema, values } = step?.controls ?? {};

  const schema = buildDynamicZodSchema(dataSchema ?? {});
  const newFormValues = useMemo(() => merge(buildDefaultValues(uiSchema ?? {}), values), [uiSchema, values]);

  const form = useForm<z.infer<typeof delayControlsSchema>>({
    resolver: zodResolver(schema),
    values: newFormValues as z.infer<typeof delayControlsSchema>,
  });

  const { updateWorkflow, isPending } = useUpdateWorkflow({
    onSuccess: () => {
      refetch();
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: TOAST_CONFIG,
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: TOAST_CONFIG,
      });
    },
  });

  useEffect(() => {
    const controlErrors = flattenIssues(step?.issues?.controls);
    Object.entries(controlErrors).forEach(([key, value]) => {
      form.setError(key as 'amount' | 'unit', { message: value });
    });
  }, [step, form]);

  const onSubmit = useCallback(
    async (data: z.infer<typeof delayControlsSchema>) => {
      if (!workflow) {
        return false;
      }

      await updateWorkflow({
        id: workflow._id,
        workflow: {
          ...workflow,
          steps: workflow.steps.map((step) =>
            step.slug === stepSlug ? { ...step, controlValues: { ...data } } : step
          ),
        },
      });

      form.reset({ ...data });
    },
    [workflow, form, updateWorkflow, stepSlug]
  );

  const debouncedSave = useMemo(() => debounce(onSubmit, 800), [onSubmit]);

  // Cleanup debounce on unmount
  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  const blocker = useBlocker(() => form.formState.isDirty || isPending);

  return (
    <>
      <SidebarContent>
        <CommonFields />
      </SidebarContent>
      <Separator />
      <SidebarContent>
        <Form {...form}>
          <form
            className="flex h-full flex-col gap-2"
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              debouncedSave(form.getValues());
            }}
          >
            <DelayAmount dataSchema={dataSchema ?? {}} isReadOnly={isReadOnly} />
          </form>
        </Form>
      </SidebarContent>
      <UnsavedChangesAlertDialog
        blocker={blocker}
        description="This editor form has some unsaved changes. Save progress before you leave."
      />
    </>
  );
};
