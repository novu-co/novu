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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchWorkflow, useFormAutoSave, useUpdateWorkflow } from '@/hooks';
import { StepTypeEnum } from '@/utils/enums';
import { handleValidationIssues } from '@/utils/handleValidationIssues';
import { buildRoute, ROUTES } from '@/utils/routes';
import { Step } from '@/utils/types';
import debounce from 'lodash.debounce';
import { RiAlertFill, RiCloseFill } from 'react-icons/ri';
import { Form } from '../primitives/form/form';
import { ToastIcon } from '../primitives/sonner';
import { showToast } from '../primitives/sonner-helpers';
import { workflowSchema } from './schema';
import { WorkflowEditorContext } from './workflow-editor-context';
import { toast } from 'sonner';
import { CheckCircleIcon } from 'lucide-react';

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

  const { reset, getValues, setError, formState } = form;
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

  const blocker = useBlocker(({ nextLocation }) => {
    const workflowEditorBasePath = buildRoute(ROUTES.EDIT_WORKFLOW, {
      workflowSlug,
      environmentSlug: currentEnvironment?.slug ?? '',
    });

    const isLeavingEditor = !nextLocation.pathname.startsWith(workflowEditorBasePath);

    return isLeavingEditor && isPending;
  });

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
    onSuccess: async (data) => {
      if (blocker.state === 'blocked') {
        // user is leaving the editor, proceed with the pending navigation
        await handleBlockedNavigation();
        return;
      }

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

  /*
   * If there was a pending navigation when saving was in progress,
   * proceed with that navigation now that changes are saved
   *
   * small timeout to briefly show the success dialog before navigating
   */
  const handleBlockedNavigation = useCallback(async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        blocker.proceed?.();
        toast.dismiss();
        resolve();
      }, 500);
    });
  }, [blocker]);

  const handleCancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

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
        <AlertDialogContent className="w-96">
          <AlertDialogHeader className="flex flex-row items-start gap-4">
            <div
              className={`rounded-lg p-3 transition-all duration-300 ${
                !isPending ? 'bg-success/10 scale-110' : 'bg-warning/10'
              }`}
            >
              <div className="transition-opacity duration-300">
                {!isPending ? (
                  <CheckCircleIcon className="text-success animate-in fade-in size-6" />
                ) : (
                  <RiAlertFill className="text-warning animate-in fade-in size-6" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <AlertDialogTitle className="transition-all duration-300">
                  {!isPending ? 'Changes saved!' : 'Saving changes'}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="transition-all duration-300">
                {!isPending ? 'Workflow has been saved successfully' : 'Please wait while we save your changes'}
              </AlertDialogDescription>
            </div>
            {isPending && (
              <button onClick={handleCancelNavigation} className="text-gray-500">
                <RiCloseFill className="size-4" />
              </button>
            )}
          </AlertDialogHeader>
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
