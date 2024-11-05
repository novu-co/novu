import { Button } from '@/components/primitives/button';

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogFooter,
} from '@/components/primitives/dialog';
import { RiAlertFill } from 'react-icons/ri';

type DeleteStepModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  stepName: string;
};

export const DeleteStepModal = ({ open, onOpenChange, onConfirm, stepName }: DeleteStepModalProps) => {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:max-w-[440px]">
          <div className="flex items-start gap-4 self-stretch">
            <div className="bg-warning/10 flex items-center justify-center gap-2 rounded-[10px] p-2">
              <RiAlertFill className="text-warning size-6" />
            </div>
            <div className="flex flex-1 flex-col items-start gap-1">
              <DialogTitle className="text-md font-medium">Are you sure?</DialogTitle>
              <DialogDescription className="text-foreground-600">
                You're about to delete the {stepName}, this action cannot be undone.
              </DialogDescription>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild aria-label="Close">
              <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild aria-label="Close">
              <Button type="button" size="sm" variant="primary" onClick={onConfirm}>
                Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
