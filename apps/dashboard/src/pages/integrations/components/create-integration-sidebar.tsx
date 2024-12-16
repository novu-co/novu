import { ChannelTypeEnum, providers as novuProviders } from '@novu/shared';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { useIntegrationList } from './hooks/use-integration-list';
import { useSidebarNavigationManager } from './hooks/use-sidebar-navigation-manager';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTabs } from './channel-tabs';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '../../../components/primitives/button';
import { handleIntegrationError } from './utils/handle-integration-error';
import { useSetPrimaryIntegration } from '../../../hooks/use-set-primary-integration';
import { SelectPrimaryIntegrationModal } from './modals/select-primary-integration-modal';
import { IntegrationFormData } from '../types';
import { useIntegrationPrimaryModal } from './hooks/use-integration-primary-modal';
import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';

export type CreateIntegrationSidebarProps = {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
};

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const providers = novuProviders;
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
  const { mutateAsync: setPrimaryIntegration, isPending: isSettingPrimary } = useSetPrimaryIntegration();
  const { integrations } = useFetchIntegrations();

  const { selectedIntegration, step, searchQuery, onIntegrationSelect, onBack } = useSidebarNavigationManager({
    isOpened,
  });

  const { integrationsByChannel } = useIntegrationList(providers, searchQuery);
  const provider = providers?.find((p) => p.id === selectedIntegration);
  const {
    isPrimaryModalOpen,
    setIsPrimaryModalOpen,
    pendingData,
    handleSubmitWithPrimaryCheck,
    handlePrimaryConfirm,
    existingPrimaryIntegration,
    isChannelSupportPrimary,
  } = useIntegrationPrimaryModal({
    onSubmit,
    integrations,
    channel: provider?.channel,
    mode: 'create',
  });
  async function onSubmit(data: IntegrationFormData) {
    if (!provider) return;

    try {
      const integration = await createIntegration({
        providerId: provider.id,
        channel: provider.channel,
        credentials: data.credentials,
        name: data.name,
        identifier: data.identifier,
        active: data.active,
        _environmentId: data.environmentId,
      });

      if (data.primary && isChannelSupportPrimary && data.active) {
        await setPrimaryIntegration({ integrationId: integration.data._id });
      }

      onClose();
    } catch (error: any) {
      handleIntegrationError(error, 'create');
    }
  }

  return (
    <>
      <IntegrationSheet
        isOpened={isOpened}
        onClose={onClose}
        provider={provider}
        mode="create"
        step={step}
        onBack={onBack}
      >
        {step === 'select' ? (
          <div className="scrollbar-custom flex-1 overflow-y-auto">
            <ChannelTabs
              integrationsByChannel={integrationsByChannel}
              searchQuery={searchQuery}
              onIntegrationSelect={onIntegrationSelect}
            />
          </div>
        ) : provider ? (
          <>
            <div className="scrollbar-custom flex-1 overflow-y-auto">
              <IntegrationConfiguration
                isChannelSupportPrimary={isChannelSupportPrimary}
                provider={provider}
                onSubmit={handleSubmitWithPrimaryCheck}
                mode="create"
              />
            </div>
            <div className="bg-background flex justify-end gap-2 border-t p-3">
              <Button
                type="submit"
                form="integration-configuration-form"
                isLoading={isPending || isSettingPrimary}
                size="sm"
              >
                Create Integration
              </Button>
            </div>
          </>
        ) : null}
      </IntegrationSheet>

      <SelectPrimaryIntegrationModal
        isOpen={isPrimaryModalOpen}
        onOpenChange={setIsPrimaryModalOpen}
        onConfirm={handlePrimaryConfirm}
        currentPrimaryName={existingPrimaryIntegration?.name}
        newPrimaryName={pendingData?.name ?? ''}
        isLoading={isPending || isSettingPrimary}
      />
    </>
  );
}
