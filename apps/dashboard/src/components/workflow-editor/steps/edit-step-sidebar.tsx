import { useLayoutEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/primitives/form/form';
import { Sheet, SheetOverlay, SheetPortal } from '@/components/primitives/sheet';
import { useFetchWorkflow, useTelemetry, useUpdateWorkflow } from '@/hooks';
import { handleValidationIssues } from '@/utils/handleValidationIssues';
import { workflowSchema } from '../schema';
import { StepEditor } from './step-editor';
import { showToast } from '@/components/primitives/sonner-helpers';
import { ToastIcon } from '@/components/primitives/sonner';
import { TelemetryEvent } from '@/utils/telemetry';
import { Separator } from '@/components/primitives/separator';
import { Button } from '@/components/primitives/button';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

export const EditStepSidebar = () => {
  const { workflowSlug = '', stepId = '' } = useParams<{ workflowSlug: string; stepId: string }>();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof workflowSchema>>({ mode: 'onSubmit', resolver: zodResolver(workflowSchema) });
  const { reset, setError } = form;
  const track = useTelemetry();

  const { workflow, error } = useFetchWorkflow({
    workflowSlug,
  });

  const step = useMemo(() => workflow?.steps.find((el) => el._id === stepId), [stepId, workflow]);

  useLayoutEffect(() => {
    if (!workflow) {
      return;
    }

    reset({ ...workflow, steps: workflow.steps.map((step) => ({ ...step })) });
  }, [workflow, error, navigate, reset]);

  const { updateWorkflow } = useUpdateWorkflow({
    onSuccess: (data) => {
      reset({ ...data, steps: data.steps.map((step) => ({ ...step })) });

      if (data.issues) {
        // TODO: remove the as any cast when BE issues are typed
        handleValidationIssues({ fields: form.getValues(), issues: data.issues as any, setError });
        return;
      }

      showToast({
        variant: 'md',
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="font-medium">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          duration: 2000,
        },
      });

      track(TelemetryEvent.WORKFLOW_STEP_SAVED, {
        type: step?.type,
      });
    },
  });

  const onSubmit = (data: z.infer<typeof workflowSchema>) => {
    if (!workflow || !form.formState.isValid) {
      return;
    }

    updateWorkflow({ id: workflow._id, workflow: { ...workflow, ...data } as any });
  };

  return (
    <Sheet open>
      <SheetPortal>
        <SheetOverlay asChild>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={transitionSetting}
          />
        </SheetOverlay>
        <motion.div
          initial={{
            x: '100%',
          }}
          animate={{
            x: 0,
          }}
          exit={{
            x: '100%',
          }}
          transition={transitionSetting}
          className={
            'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l shadow-lg sm:max-w-[600px]'
          }
        >
          <Form {...form}>
            <form
              className="flex h-full flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit(onSubmit)(event);
              }}
              id="edit-step"
            >
              {step && <StepEditor stepType={step?.type} />}
              <Separator />
              <footer className="flex justify-end px-3 py-3.5">
                <Button
                  className="ml-auto"
                  variant="default"
                  type="submit"
                  disabled={!form.formState.isDirty || form.formState.isSubmitting}
                  form="edit-step"
                >
                  Save step
                </Button>
              </footer>
            </form>
          </Form>
        </motion.div>
      </SheetPortal>
    </Sheet>
  );
};
