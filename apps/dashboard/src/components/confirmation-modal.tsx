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

type ConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmButtonText: string;
};

export const ConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText,
}: ConfirmationModalProps) => {
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
              <DialogTitle className="text-md font-medium">{title}</DialogTitle>
              <DialogDescription className="text-foreground-600">{description}</DialogDescription>
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
                {confirmButtonText}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
