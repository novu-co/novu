import { ChannelTypeEnum } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchIntegrations } from '../../../hooks/use-fetch-integrations';
import { ITableIntegration } from '../types';
import { IntegrationChannelGroup } from './integration-channel-group';
import { Skeleton } from '@/components/primitives/skeleton';

interface IntegrationsListProps {
  onAddProviderClick: () => void;
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
  onChannelClick: (channel: ChannelTypeEnum) => void;
}

function IntegrationCardSkeleton() {
  return (
    <div className="bg-card group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-3 shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

function IntegrationChannelGroupSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <IntegrationCardSkeleton />
        <IntegrationCardSkeleton />
        <IntegrationCardSkeleton />
      </div>
    </div>
  );
}

export function IntegrationsList({ onAddProviderClick, onRowClickCallback, onChannelClick }: IntegrationsListProps) {
  const { currentEnvironment, environments } = useEnvironment();
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();

  if (!integrations || !providers || !currentEnvironment) {
    return (
      <div className="space-y-6">
        <IntegrationChannelGroupSkeleton />
        <IntegrationChannelGroupSkeleton />
      </div>
    );
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
    <div className="space-y-6">
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
