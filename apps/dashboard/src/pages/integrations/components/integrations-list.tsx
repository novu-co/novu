import { ChannelTypeEnum } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchIntegrations } from '../../../hooks/use-fetch-integrations';
import { ITableIntegration } from '../types';
import { IntegrationsEmptyState } from './integrations-empty-state';
import { IntegrationChannelGroup } from './integration-channel-group';

interface IntegrationsListProps {
  onAddProviderClick: () => void;
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
  onChannelClick: (channel: ChannelTypeEnum) => void;
}

export function IntegrationsList({ onAddProviderClick, onRowClickCallback, onChannelClick }: IntegrationsListProps) {
  const { currentEnvironment, environments } = useEnvironment();
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();

  if (!integrations || !providers || !currentEnvironment) {
    return <IntegrationsEmptyState onAddProviderClick={onAddProviderClick} />;
  }

  // Group integrations by channel
  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      const channel = integration.channel;
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(integration);
      return acc;
    },
    {} as Record<ChannelTypeEnum, typeof integrations>
  );

  return (
    <div className="space-y-12">
      {Object.entries(groupedIntegrations).map(([channel, channelIntegrations]) => (
        <IntegrationChannelGroup
          key={channel}
          channel={channel as ChannelTypeEnum}
          integrations={channelIntegrations}
          providers={providers}
          environments={environments}
          onRowClickCallback={onRowClickCallback}
        />
      ))}
    </div>
  );
}
