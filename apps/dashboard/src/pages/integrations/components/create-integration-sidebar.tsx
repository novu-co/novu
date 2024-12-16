import { ChannelTypeEnum } from '@novu/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import { useProviders } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { useIntegrationList } from './hooks/use-integration-list';
import { useSidebarNavigationManager } from './hooks/use-sidebar-navigation-manager';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTabs } from './channel-tabs';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '../../../components/primitives/button';
import { handleIntegrationError } from './utils/handle-integration-error';

export interface CreateIntegrationSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const { providers } = useProviders();
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
  const { selectedIntegration, step, searchQuery, onIntegrationSelect, onBack } = useSidebarNavigationManager({
    isOpened,
  });

  const { integrationsByChannel } = useIntegrationList(providers, searchQuery);
  const provider = providers?.find((p) => p.id === selectedIntegration);

  const onSubmit = async (data: any) => {
    if (!provider) return;

    try {
      await createIntegration({
        providerId: provider.id,
        channel: provider.channel,
        credentials: data.credentials,
        name: data.name,
        identifier: data.identifier,
        active: data.active,
        _environmentId: data.environmentId,
      });

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id],
      });
      onClose();
    } catch (error: any) {
      handleIntegrationError(error, 'create');
    }
  };

  return (
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
            <IntegrationConfiguration provider={provider} onSubmit={onSubmit} mode="create" />
          </div>
          <div className="bg-background flex justify-end gap-2 border-t p-3">
            <Button type="submit" form="integration-configuration-form" isLoading={isPending} size="sm">
              Create Integration
            </Button>
          </div>
        </>
      ) : null}
    </IntegrationSheet>
  );
}
