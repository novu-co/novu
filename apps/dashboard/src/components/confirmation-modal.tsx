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
import { ReactNode } from 'react';
import { RiAlertFill } from 'react-icons/ri';
import { Button } from './primitives/button';

type ConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmButtonText: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
};

export const ConfirmationModal = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmButtonText,
  isLoading,
  isConfirmDisabled,
}: ConfirmationModalProps) => {
  return (
    <Dialog modal open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="pb-0 sm:max-w-[440px]" hideClose={true}>
          <div className="flex items-start gap-4 self-stretch">
            <div className="bg-warning/10 flex items-center justify-center gap-2 rounded-[10px] p-2">
              <RiAlertFill className="text-warning size-6" />
            </div>
            <div className="flex flex-1 flex-col items-start gap-1">
              <DialogTitle className="text-label-md !font-medium">{title}</DialogTitle>
              <DialogDescription className="text-text-sub text-paragraph-sm">{description}</DialogDescription>
            </div>
          </div>
          <DialogFooter className="!py-4">
            <DialogClose asChild aria-label="Close">
              <Button type="button" size="sm" variant="secondary" mode="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={onConfirm}
              isLoading={isLoading}
              disabled={isConfirmDisabled}
            >
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
