import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

import { Sheet, SheetOverlay, SheetPortal } from '@/components/primitives/sheet';
import { useFetchWorkflow } from '@/hooks/use-fetch-workflow';
import { StepEditor } from '@/components/workflow-editor/steps/step-editor';
import { useFetchStep } from '@/hooks/use-fetch-step';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

export const EditStepSidebar = () => {
  const { workflowSlug = '', stepSlug = '' } = useParams<{ workflowSlug: string; stepSlug: string }>();

  const { workflow } = useFetchWorkflow({
    workflowSlug,
  });

  const { step } = useFetchStep({ workflowSlug, stepSlug });
  const stepType = useMemo(() => workflow?.steps.find((el) => el.slug === stepSlug)?.type, [stepSlug, workflow]);

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
          {/* TODO: show loading indicator */}
          {workflow && step && stepType && <StepEditor workflow={workflow} step={step} stepType={stepType} />}
        </motion.div>
      </SheetPortal>
    </Sheet>
  );
};
