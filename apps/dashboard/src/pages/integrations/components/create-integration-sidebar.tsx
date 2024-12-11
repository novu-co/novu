import { ChannelTypeEnum, IProviderConfig } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { useIntegrationList } from './hooks/use-integration-list';
import { useIntegrationForm } from './hooks/use-integration-form';
import { useIntegrationSteps } from '../hooks/use-integration-steps';
import { IntegrationSheet } from './integration-sheet';
import { ChannelTabs } from './channel-tabs';
import { IntegrationSearch } from './integration-search';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '../../../components/primitives/button';
import { IntegrationFormData } from './types';

export interface CreateIntegrationSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const { providers } = useProviders();
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
  const { selectedIntegration, step, searchQuery, setSearchQuery, onIntegrationSelect, onBack } = useIntegrationSteps({
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
      <div className="flex-1 overflow-y-auto">
        {step === 'select' && (
          <SelectStep
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            integrationsByChannel={integrationsByChannel}
            onIntegrationSelect={onIntegrationSelect}
          />
        )}
        {step !== 'select' && provider && (
          <ConfigurationStep provider={provider} onSubmit={onSubmit} isPending={isPending} />
        )}
      </div>
    </IntegrationSheet>
  );
}

interface SelectStepProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  integrationsByChannel: Record<string, any[]>;
  onIntegrationSelect: (providerId: string) => void;
}

function SelectStep({ searchQuery, setSearchQuery, integrationsByChannel, onIntegrationSelect }: SelectStepProps) {
  return (
    <>
      <IntegrationSearch value={searchQuery} onChange={setSearchQuery} />
      <ChannelTabs
        integrationsByChannel={integrationsByChannel}
        searchQuery={searchQuery}
        onIntegrationSelect={onIntegrationSelect}
      />
    </>
  );
}

interface ConfigurationStepProps {
  provider: IProviderConfig;
  onSubmit: (data: IntegrationFormData) => Promise<void>;
  isPending: boolean;
}

function ConfigurationStep({ provider, onSubmit, isPending }: ConfigurationStepProps) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <IntegrationConfiguration provider={provider} onSubmit={onSubmit} mode="create" />
      </div>
      <div className="border-border bg-background mt-auto flex items-center justify-end gap-2 border-t p-4">
        <Button type="submit" form="integration-configuration-form" isLoading={isPending}>
          Create Integration
        </Button>
      </div>
    </>
  );
}
