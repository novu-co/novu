import { ConfirmationModal } from '@/components/confirmation-modal';

export type DeleteIntegrationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPrimary?: boolean;
};

export function DeleteIntegrationModal({ isOpen, onOpenChange, onConfirm, isPrimary }: DeleteIntegrationModalProps) {
  const description = isPrimary ? (
    <>
      <p>Are you sure you want to delete this primary integration?</p>
      <p>This will disable the channel until you set up a new integration.</p>
    </>
  ) : (
    <p>Are you sure you want to delete this integration?</p>
  );

  return (
    <ConfirmationModal
      open={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={`Delete ${isPrimary ? 'Primary ' : ''}Integration`}
      description={description}
      confirmButtonText="Delete Integration"
    />
  );
}
