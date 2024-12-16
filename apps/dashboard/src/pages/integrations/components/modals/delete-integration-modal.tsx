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

export type DeleteIntegrationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPrimary?: boolean;
};

export function DeleteIntegrationModal({ isOpen, onOpenChange, onConfirm, isPrimary }: DeleteIntegrationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {isPrimary ? 'Primary ' : ''}Integration</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isPrimary ? (
              <>
                <p>Are you sure you want to delete this primary integration?</p>
                <p>This will disable the channel until you set up a new integration.</p>
              </>
            ) : (
              <p>Are you sure you want to delete this integration?</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete Integration</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
