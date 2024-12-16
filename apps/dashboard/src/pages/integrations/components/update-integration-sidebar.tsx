import { useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import { useUpdateIntegration } from '@/hooks/use-update-integration';
import { useSetPrimaryIntegration } from '@/hooks/use-set-primary-integration';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '@/components/primitives/button';
import { DeleteIntegrationModal } from './modals/delete-integration-modal';
import { SelectPrimaryIntegrationModal } from './modals/select-primary-integration-modal';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTypeEnum, providers as novuProviders, IIntegration, CHANNELS_WITH_PRIMARY } from '@novu/shared';
import { IntegrationFormData } from '../types';
import { useDeleteIntegration } from '../../../hooks/use-delete-integration';
import { handleIntegrationError } from './utils/handle-integration-error';

type UpdateIntegrationSidebarProps = {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
};

export function UpdateIntegrationSidebar({ isOpened, integrationId, onClose }: UpdateIntegrationSidebarProps) {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const { integrations } = useFetchIntegrations();
  const providers = novuProviders;
  const { deleteIntegration, isLoading: isDeleting } = useDeleteIntegration();
  const { mutateAsync: updateIntegration, isPending: isUpdating } = useUpdateIntegration();
  const { mutateAsync: setPrimaryIntegration, isPending: isSettingPrimary } = useSetPrimaryIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<IntegrationFormData | null>(null);

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p) => p.id === integration?.providerId);
  const existingPrimaryIntegration = integrations?.find(
    (i) => i.primary && i.channel === integration?.channel && i._id !== integration?._id
  );

  const handleSubmit = async (data: IntegrationFormData, skipPrimaryCheck = false) => {
    if (!integration) return;

    /**
     * We don't want to check the integration if it's a demo integration
     * Since we don't have credentials for it
     */
    if (integration?.providerId === 'novu-email' || integration?.providerId === 'novu-sms') {
      data.check = false;
    }

    if (!skipPrimaryCheck && shouldShowPrimaryModal(data, integration, integrations)) {
      setIsPrimaryModalOpen(true);

      setPendingUpdate(data);

      return;
    }

    try {
      await updateIntegration({
        integrationId: integration._id,
        data: {
          name: data.name,
          identifier: data.identifier,
          active: data.active,
          primary: data.primary,
          credentials: data.credentials,
          check: data.check,
        },
      });

      if (data.primary) {
        await setPrimaryIntegration({ integrationId: integration._id });
      }

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id],
      });
      onClose();
    } catch (error: any) {
      handleIntegrationError(error, 'update');
    }
  };

  const handlePrimaryConfirm = async () => {
    if (pendingUpdate) {
      try {
        await handleSubmit(pendingUpdate, true);
        setPendingUpdate(null);
        setIsPrimaryModalOpen(false);
      } catch (error: any) {
        handleIntegrationError(error, 'update');
      }
    } else {
      setIsPrimaryModalOpen(false);
    }
  };

  const onDelete = async () => {
    if (!integration) return;

    try {
      await deleteIntegration({ id: integration._id });
      toast.success('Integration deleted successfully');
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      handleIntegrationError(error, 'delete');
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
            onSubmit={(data) => handleSubmit(data)}
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

function shouldShowPrimaryModal(
  data: IntegrationFormData,
  integration: IIntegration,
  integrations: IIntegration[] = []
) {
  if (!integration || !integrations) return false;

  const hasSameChannelActiveIntegration = integrations?.some(
    (el) => el._id !== integration._id && el.active && el.channel === integration.channel
  );

  const isChangingToActive = !integration.active && data.active;
  const isChangingToInactiveAndPrimary = integration.active && !data.active && integration.primary;
  const isChangingToPrimary = !integration.primary && data.primary;
  const isChannelSupportPrimary = CHANNELS_WITH_PRIMARY.includes(integration.channel);
  const existingPrimaryIntegration = integrations?.find(
    (el) => el._id !== integration._id && el.primary && el.channel === integration.channel
  );

  return (
    isChannelSupportPrimary &&
    (isChangingToActive || isChangingToInactiveAndPrimary || (isChangingToPrimary && existingPrimaryIntegration)) &&
    hasSameChannelActiveIntegration
  );
}
