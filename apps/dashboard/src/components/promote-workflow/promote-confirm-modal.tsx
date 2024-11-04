import { Button } from '@/components/primitives/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnvironment } from '@/context/environment/hooks';
import { WorkflowResponseDto } from '@novu/shared';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { RiAlertFill } from 'react-icons/ri';

interface PromoteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: UseMutateAsyncFunction<WorkflowResponseDto, unknown, void, void>;
}

export function PromoteConfirmModal({ open, onOpenChange, onConfirm }: PromoteConfirmModalProps) {
  const { oppositeEnvironment } = useEnvironment();

  async function onConfirmClick() {
    onOpenChange(false);
    await onConfirm();
  }

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
              <DialogTitle className="text-md font-medium">Sync workflow to {oppositeEnvironment?.name}</DialogTitle>
              <DialogDescription className="text-foreground-600">
                Workflow already exists in {oppositeEnvironment?.name}. Proceeding will overwrite the existing workflow.
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
              <Button type="button" size="sm" variant="primary" onClick={onConfirmClick}>
                Proceed
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
