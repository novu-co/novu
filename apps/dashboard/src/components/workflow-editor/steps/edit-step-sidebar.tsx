import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  Sheet,
  SheetContentBase,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from '@/components/primitives/sheet';
import { StepEditor } from '@/components/workflow-editor/steps/step-editor';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import { PageMeta } from '@/components/page-meta';
import { StepSkeleton } from './step-skeleton';
import { StepEditorProvider } from './step-editor-provider';
import { useStepEditorContext } from './hooks';
import { useWorkflowEditorContext } from '../hooks';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

const EditStepSidebarInternal = () => {
  const navigate = useNavigate();
  const { workflow, isPendingWorkflow } = useWorkflowEditorContext();
  const { step, stepType, isPendingStep } = useStepEditorContext();
  const handleCloseSidebar = () => {
    navigate('..', { relative: 'path' });
  };

  const isPending = isPendingWorkflow || isPendingStep;

  return (
    <>
      <PageMeta title={`Edit ${step?.name}`} />
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
          <SheetContentBase asChild onInteractOutside={handleCloseSidebar} onEscapeKeyDown={handleCloseSidebar}>
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
                'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l shadow-lg outline-none sm:max-w-[600px]'
              }
            >
              <VisuallyHidden>
                <SheetTitle />
                <SheetDescription />
              </VisuallyHidden>
              {isPending ? (
                <StepSkeleton stepType={stepType} workflowOrigin={workflow?.origin} />
              ) : (
                <>
                  {workflow && step && stepType && <StepEditor workflow={workflow} step={step} stepType={stepType} />}
                </>
              )}
            </motion.div>
          </SheetContentBase>
        </SheetPortal>
      </Sheet>
    </>
  );
};

export const EditStepSidebar = () => {
  return (
    <StepEditorProvider>
      <EditStepSidebarInternal />
    </StepEditorProvider>
  );
};
