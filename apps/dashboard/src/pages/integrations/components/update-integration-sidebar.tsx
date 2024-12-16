import { useState } from 'react';
import { toast } from 'sonner';
import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';
import { useProviders } from '@/hooks/use-providers';
import { useIntegrationForm } from './hooks/use-integration-form';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '@/components/primitives/button';
import { DeleteIntegrationModal } from './modals/delete-integration-modal';
import { SelectPrimaryIntegrationModal } from './modals/select-primary-integration-modal';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTypeEnum } from '@novu/shared';
import { IntegrationFormData } from '../types';
import { useDeleteIntegration } from '../../../hooks/use-delete-integration';

interface UpdateIntegrationSidebarProps {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}

export function UpdateIntegrationSidebar({ isOpened, integrationId, onClose }: UpdateIntegrationSidebarProps) {
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();
  const { deleteIntegration, isLoading: isDeleting } = useDeleteIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<IntegrationFormData | null>(null);

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p) => p.id === integration?.providerId);
  const existingPrimaryIntegration = integrations?.find(
    (i) => i.primary && i.channel === integration?.channel && i._id !== integration?._id
  );

  const { executeUpdate, shouldShowPrimaryModal, isUpdating, isSettingPrimary } = useIntegrationForm({
    onClose,
    integration,
    integrations,
  });

  const handleSubmit = async (data: IntegrationFormData) => {
    if (shouldShowPrimaryModal(data)) {
      setIsPrimaryModalOpen(true);

      /**
       * We don't want to check the integration if it's a demo integration
       * Since we don't have credentials for it
       */
      if (integration?.providerId === 'novu-email' || integration?.providerId === 'novu-sms') {
        data.check = false;
      }

      setPendingUpdate(data);

      return;
    }

    await executeUpdate(data);
  };

  const handlePrimaryConfirm = async () => {
    if (pendingUpdate) {
      await executeUpdate(pendingUpdate);
      setPendingUpdate(null);
    }
    setIsPrimaryModalOpen(false);
  };

  const onDelete = async () => {
    if (!integration) return;

    try {
      await deleteIntegration({ id: integration._id });
      toast.success('Integration deleted successfully');
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      toast.error('Failed to delete integration', {
        description: error?.message || 'There was an error deleting the integration.',
      });
    }
  };

  if (!integration || !provider) return null;

  return (
    <>
      <IntegrationSheet isOpened={isOpened} onClose={onClose} provider={provider} mode="update">
        <div className="scrollbar-custom flex-1 overflow-y-auto">
          <IntegrationConfiguration
            provider={provider}
            integration={integration}
            onSubmit={handleSubmit}
            mode="update"
          />
        </div>

        <div className="bg-background flex justify-between gap-2 border-t p-3">
          {integration.channel !== ChannelTypeEnum.IN_APP && (
            <Button
              variant="ghostDestructive"
              size="sm"
              isLoading={isDeleting}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Integration
            </Button>
          )}
          <Button
            type="submit"
            form="integration-configuration-form"
            className="ml-auto"
            isLoading={isUpdating || isSettingPrimary}
            size="sm"
          >
            Save Changes
          </Button>
        </div>
      </IntegrationSheet>

      <DeleteIntegrationModal
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={onDelete}
        isPrimary={integration.primary}
      />

      <SelectPrimaryIntegrationModal
        isOpen={isPrimaryModalOpen}
        onOpenChange={setIsPrimaryModalOpen}
        onConfirm={handlePrimaryConfirm}
        currentPrimaryName={existingPrimaryIntegration?.name}
        newPrimaryName={integration.name}
        isLoading={isUpdating || isSettingPrimary}
      />
    </>
  );
}
