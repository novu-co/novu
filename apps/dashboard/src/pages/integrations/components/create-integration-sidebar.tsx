import { ChannelTypeEnum } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { useIntegrationList } from './hooks/use-integration-list';
import { useIntegrationForm } from './hooks/use-integration-form';
import { useSidebarNavigationManager } from './hooks/use-sidebar-navigation-manager';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTabs } from './channel-tabs';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '../../../components/primitives/button';

export interface CreateIntegrationSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const { providers } = useProviders();
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
  const { selectedIntegration, step, searchQuery, onIntegrationSelect, onBack } = useSidebarNavigationManager({
    isOpened,
  });

  const { integrationsByChannel } = useIntegrationList(providers, searchQuery);
  const { executeCreate } = useIntegrationForm({
    onClose,
    createIntegration: async ({ data, provider }) => {
      await createIntegration({
        providerId: provider.id,
        channel: provider.channel,
        credentials: data.credentials,
        name: data.name,
        identifier: data.identifier,
        active: data.active,
        _environmentId: data.environmentId,
      });
    },
  });

  const provider = providers?.find((p) => p.id === selectedIntegration);

  const onSubmit = async (data: any) => {
    if (!provider) return;

    await executeCreate(data, provider);
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
