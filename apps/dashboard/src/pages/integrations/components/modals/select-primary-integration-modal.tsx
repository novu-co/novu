import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';

export type SelectPrimaryIntegrationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentPrimaryName?: string;
  newPrimaryName?: string;
  isLoading?: boolean;
};

export function SelectPrimaryIntegrationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  currentPrimaryName,
  newPrimaryName,
  isLoading,
}: SelectPrimaryIntegrationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Primary Integration</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will change the primary integration from <span className="font-medium">{currentPrimaryName}</span> to{' '}
              <span className="font-medium">{newPrimaryName}</span>.
            </p>
            <p>
              The current primary integration will be disabled and all future notifications will be sent through the new
              primary integration.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
