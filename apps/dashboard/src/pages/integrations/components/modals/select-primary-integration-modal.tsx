import { ConfirmationModal } from '@/components/confirmation-modal';

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
  const description = (
    <>
      <p>
        This will change the primary integration from <span className="font-medium">{currentPrimaryName}</span> to{' '}
        <span className="font-medium">{newPrimaryName}</span>.
      </p>
      <p>
        The current primary integration will be disabled and all future notifications will be sent through the new
        primary integration.
      </p>
    </>
  );

  return (
    <ConfirmationModal
      open={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Change Primary Integration"
      description={description}
      confirmButtonText="Continue"
      isLoading={isLoading}
    />
  );
}
