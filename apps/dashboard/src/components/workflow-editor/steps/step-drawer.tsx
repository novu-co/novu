import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { Sheet, SheetContentBase, SheetDescription, SheetPortal, SheetTitle } from '@/components/primitives/sheet';
import { VisuallyHidden } from '@/components/primitives/visually-hidden';
import { PageMeta } from '@/components/page-meta';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { StepTypeEnum } from '@novu/shared';
import { cn } from '@/utils/ui';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };
const stepTypeToClassname: Record<string, string | undefined> = {
  [StepTypeEnum.IN_APP]: 'sm:max-w-[600px]',
  [StepTypeEnum.EMAIL]: 'sm:max-w-[800px]',
};

export const StepDrawer = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  const navigate = useNavigate();
  const { workflow, step } = useWorkflow();
  const handleCloseSheet = () => {
    if (step) {
      // Do not use relative path here, calling twice will result in moving further back
      navigate(`../steps/${step.slug}`);
    }
  };

  if (!workflow || !step) {
    return null;
  }

  return (
    <>
      <PageMeta title={title} />
      <Sheet modal={false} open>
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
          className="fixed inset-0 z-50 h-screen w-screen bg-black/20"
          transition={transitionSetting}
        />
        <SheetPortal>
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
              {children}
            </motion.div>
          </SheetContentBase>
        </SheetPortal>
      </Sheet>
    </>
  );
};
