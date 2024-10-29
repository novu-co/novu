import { useNavigate } from 'react-router-dom';
import { RiEdit2Line } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import {
  Sheet,
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetMain,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from '@/components/primitives/sheet';
import { Cross2Icon } from '@radix-ui/react-icons';

const transitionSetting = { ease: [0.29, 0.83, 0.57, 0.99], duration: 0.4 };

const StepEditor = () => {
  return <div>Step Editor</div>;
};

export const EditStepSidebar = () => {
  const navigate = useNavigate();

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
          <SheetClose
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-neutral-alpha-100 absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => {
              navigate('../', { relative: 'path' });
            }}
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
          <SheetHeader className="px-3 py-3.5">
            <SheetTitle>
              <div className="flex items-center gap-2.5 text-sm font-medium">
                <RiEdit2Line className="size-4" />
                <span>Configure Template</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <Separator />
          <SheetMain>
            <StepEditor />
          </SheetMain>
          <Separator />
          <SheetFooter>
            <Button variant="default" type="submit" form="create-workflow">
              Save step
            </Button>
          </SheetFooter>
        </motion.div>
      </SheetPortal>
    </Sheet>
  );
};
