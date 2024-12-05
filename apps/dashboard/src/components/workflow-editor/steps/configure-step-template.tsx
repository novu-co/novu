import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import {
  Sheet,
  SheetContentBase,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from '@/components/primitives/sheet';
import { ConfigureStepTemplateForm } from '@/components/workflow-editor/steps/configure-step-template-form';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import { PageMeta } from '@/components/page-meta';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useStep } from '@/components/workflow-editor/steps/step-provider';
import { StepTypeEnum } from '@novu/shared';
import { cn } from '@/utils/ui';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };
const stepTypeToClassname: Record<string, string | undefined> = {
  [StepTypeEnum.IN_APP]: 'sm:max-w-[600px]',
  [StepTypeEnum.EMAIL]: 'sm:max-w-[800px]',
};

export const ConfigureStepTemplate = () => {
  const navigate = useNavigate();
  const { workflow, update } = useWorkflow();
  const { step, updateStepCache, issues } = useStep();
  const handleCloseSheet = () => {
    navigate('..', { relative: 'path' });
  };

  if (!workflow || !step) {
    return null;
  }

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
          <SheetContentBase asChild onInteractOutside={handleCloseSheet} onEscapeKeyDown={handleCloseSheet}>
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
              className={cn(
                'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l shadow-lg outline-none sm:max-w-[600px]',
                stepTypeToClassname[step.type]
              )}
            >
              <VisuallyHidden>
                <SheetTitle />
                <SheetDescription />
              </VisuallyHidden>
              <ConfigureStepTemplateForm
                workflow={workflow}
                step={step}
                issues={issues}
                update={update}
                updateStepCache={updateStepCache}
              />
            </motion.div>
          </SheetContentBase>
        </SheetPortal>
      </Sheet>
    </>
  );
};
