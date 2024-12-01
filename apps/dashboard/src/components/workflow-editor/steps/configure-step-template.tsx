import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

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
import { getEncodedId, STEP_DIVIDER } from '@/utils/step';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

export const ConfigureStepTemplate = () => {
  const { stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const navigate = useNavigate();
  const { workflow, update } = useWorkflow();
  const { step } = useStep();
  const handleCloseSheet = () => {
    navigate('..', { relative: 'path' });
  };
  const issues = useMemo(() => {
    const newIssues = workflow?.steps.find(
      (s) =>
        getEncodedId({ slug: s.slug, divider: STEP_DIVIDER }) ===
        getEncodedId({ slug: stepSlug, divider: STEP_DIVIDER })
    )?.issues;

    return { ...newIssues };
  }, [workflow, stepSlug]);

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
              className={
                'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l shadow-lg outline-none sm:max-w-[600px]'
              }
            >
              <VisuallyHidden>
                <SheetTitle />
                <SheetDescription />
              </VisuallyHidden>
              <ConfigureStepTemplateForm workflow={workflow} step={step} update={update} issues={issues} />
            </motion.div>
          </SheetContentBase>
        </SheetPortal>
      </Sheet>
    </>
  );
};
