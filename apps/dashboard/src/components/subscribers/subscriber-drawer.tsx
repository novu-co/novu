import { motion } from 'motion/react';
import { Sheet, SheetContentBase, SheetDescription, SheetPortal, SheetTitle } from '../primitives/sheet';
import { VisuallyHidden } from '../primitives/visually-hidden';
import { useNavigate } from 'react-router-dom';
import { PropsWithChildren } from 'react';

const transitionSetting = { duration: 0.4 };

type SubscriberDrawerProps = PropsWithChildren<{
  open: boolean;
}>;

export function SubscriberDrawer({ children, open }: SubscriberDrawerProps) {
  const navigate = useNavigate();

  const handleCloseSheet = () => {
    navigate(-1);
  };
  return (
    <Sheet modal={false} open={open}>
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
            className={
              'bg-background fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col border-l shadow-lg outline-none sm:max-w-[600px]'
            }
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
  );
}
