import { Form } from '@/components/primitives/form/form';
import { Sheet, SheetOverlay, SheetPortal } from '@/components/primitives/sheet';
import { useFetchWorkflow, useUpdateWorkflow } from '@/hooks';
import { handleValidationIssues } from '@/utils/handleValidationIssues';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useLayoutEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { workflowSchema } from '../schema';
import { StepEditor } from './step-editor';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

export const EditStepSidebar = () => {
  const { workflowSlug = '', stepId = '' } = useParams<{ workflowSlug: string; stepId: string }>();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof workflowSchema>>({ mode: 'onSubmit', resolver: zodResolver(workflowSchema) });
  const { reset, setError } = form;

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
      }

      // TODO: show the toast
      navigate(`../`, { relative: 'path' });
    },
  });

  const onSubmit = (data: z.infer<typeof workflowSchema>) => {
    if (!workflow) {
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
            >
              {step && <StepEditor stepType={step?.type} />}
            </form>
          </Form>
        </motion.div>
      </SheetPortal>
    </Sheet>
  );
};
