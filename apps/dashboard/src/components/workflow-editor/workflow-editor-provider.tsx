import { ReactNode, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
// eslint-disable-next-line
// @ts-ignore
import { zodResolver } from '@hookform/resolvers/zod';
import { WorkflowOriginEnum, WorkflowResponseDto } from '@novu/shared';
import * as z from 'zod';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';
import { buttonVariants } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchWorkflow, useFormAutoSave, useUpdateWorkflow } from '@/hooks';
import { StepTypeEnum } from '@/utils/enums';
import { handleValidationIssues } from '@/utils/handleValidationIssues';
import { buildRoute, ROUTES } from '@/utils/routes';
import { Step } from '@/utils/types';
import debounce from 'lodash.debounce';
import { RiAlertFill } from 'react-icons/ri';
import { Form } from '../primitives/form/form';
import { ToastIcon } from '../primitives/sonner';
import { showToast } from '../primitives/sonner-helpers';
import { workflowSchema } from './schema';
import { WorkflowEditorContext } from './workflow-editor-context';

const STEP_NAME_BY_TYPE: Record<StepTypeEnum, string> = {
  email: 'Email Step',
  chat: 'Chat Step',
  in_app: 'In-App Step',
  sms: 'SMS Step',
  push: 'Push Step',
  digest: 'Digest Step',
  delay: 'Delay Step',
  trigger: 'Trigger Step',
  custom: 'Custom Step',
};

const createStep = (type: StepTypeEnum): Step => ({
  name: STEP_NAME_BY_TYPE[type],
  stepId: '',
  slug: '_st_',
  type,
  _id: crypto.randomUUID(),
});

export const WorkflowEditorProvider = ({ children }: { children: ReactNode }) => {
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug = '' } = useParams<{ workflowSlug?: string; stepSlug?: string }>();
  const navigate = useNavigate();
  const [toastId, setToastId] = useState<string | number>('');

  const {
    workflow,
    isPending: isPendingWorkflow,
    error,
  } = useFetchWorkflow({
    workflowSlug,
  });
  const defaultFormValues = useMemo(
    () => ({ ...workflow, steps: workflow?.steps.map((step) => ({ ...step })) }),
    [workflow]
  );

  const form = useForm<z.infer<typeof workflowSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(workflowSchema),
    defaultValues: defaultFormValues,
  });

  const {
    reset,
    getValues,
    setError,
    formState: { isDirty },
  } = form;
  const steps = useFieldArray({
    control: form.control,
    name: 'steps',
  });
  const isReadOnly = workflow?.origin === WorkflowOriginEnum.EXTERNAL;

  const resetWorkflowForm = useCallback(
    (workflow: WorkflowResponseDto) => {
      reset({ ...workflow, steps: workflow.steps.map((step) => ({ ...step })) });
    },
    [reset]
  );

  useLayoutEffect(() => {
    if (error) {
      navigate(buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment?.slug ?? '' }));
    }

    if (!workflow) {
      return;
    }

    resetWorkflowForm(workflow);
  }, [workflow, error, navigate, resetWorkflowForm, currentEnvironment]);

  const { updateWorkflow, isPending } = useUpdateWorkflow({
    onMutate: () => {
      setToastId(
        showToast({
          children: () => (
            <>
              <ToastIcon variant={'default'} />
              <span className="text-sm">Saving</span>
            </>
          ),
          options: {
            position: 'bottom-left',
            classNames: {
              toast: 'ml-10',
            },
          },
        })
      );
    },
    onSuccess: (data) => {
      resetWorkflowForm(data);

      if (data.issues) {
        // TODO: remove the as any cast when BE issues are typed
        handleValidationIssues({ fields: getValues(), issues: data.issues as any, setError });
      }

      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-left',
          classNames: {
            toast: 'ml-10',
          },
          id: toastId,
        },
      });
    },
  });

  const blocker = useBlocker(isDirty || isPending);

  const onSubmit = useCallback(
    async (data: z.infer<typeof workflowSchema>) => {
      if (!workflow || !form.formState.isDirty || isReadOnly) {
        return;
      }

      updateWorkflow({ id: workflow._id, workflow: { ...workflow, ...data } as any });
    },
    [workflow, form.formState.isDirty, isReadOnly, updateWorkflow]
  );

  const debouncedSave = useCallback(debounce(form.handleSubmit(onSubmit), 800), [
    form.handleSubmit,
    onSubmit,
    debounce,
  ]);

  useFormAutoSave({
    form,
    debouncedSave,
    shouldFlush: (previousData, data) => {
      const currentStepsLength = data?.steps?.length ?? 0;
      const wasStepsLengthAltered = previousData.steps != null && currentStepsLength !== previousData.steps?.length;
      if (wasStepsLengthAltered) {
        return true;
      }

      const currentTagsLength = data?.tags?.length ?? 0;
      const wasTagsLengthAltered = previousData.tags != null && currentTagsLength !== previousData.tags?.length;
      if (wasTagsLengthAltered) {
        return true;
      }

      return false;
    },
  });

  const addStep = useCallback(
    (channelType: StepTypeEnum, stepIndex?: number) => {
      const newStep = createStep(channelType);
      if (stepIndex != null) {
        steps.insert(stepIndex, newStep);
      } else {
        steps.append(newStep);
      }
    },
    [steps]
  );

  const deleteStep = useCallback(
    (stepSlug: string) => {
      const newSteps = steps.fields.filter((step) => step.slug !== stepSlug);

      steps.replace(newSteps);
    },
    [steps]
  );

  const value = useMemo(
    () => ({
      isPendingWorkflow,
      workflow,
      isReadOnly,
      addStep,
      deleteStep,
      resetWorkflowForm,
    }),
    [isPendingWorkflow, workflow, isReadOnly, addStep, deleteStep, resetWorkflowForm]
  );

  return (
    <WorkflowEditorContext.Provider value={value}>
      <AlertDialog open={blocker.state === 'blocked'}>
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-row items-start gap-4">
            <div className="bg-warning/10 rounded-lg p-3">
              <RiAlertFill className="text-warning size-6" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle>You might lose your progress</AlertDialogTitle>
              <AlertDialogDescription>
                This workflow has some unsaved changes. Save progress before you leave.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <Separator />

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blocker.proceed?.()}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Proceed anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Form {...form}>
        <form className="h-full" onBlur={debouncedSave.flush}>
          {children}
        </form>
      </Form>
    </WorkflowEditorContext.Provider>
  );
};
