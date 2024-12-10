import { ChannelTypeEnum, IEnvironment, IIntegration } from '@novu/shared';
import { ITableIntegration } from '../types';
import { IntegrationCard } from './integration-card';
import { IProvider } from '@/hooks/use-providers';

interface IntegrationChannelGroupProps {
  channel: ChannelTypeEnum;
  integrations: IIntegration[];
  providers: IProvider[];
  environments?: IEnvironment[];
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
}

export function IntegrationChannelGroup({
  channel,
  integrations,
  providers,
  environments,
  onRowClickCallback,
}: IntegrationChannelGroupProps) {
  // Function to get human readable channel name
  const getChannelTitle = (channel: ChannelTypeEnum) => {
    return channel
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-md text-foreground-950 font-semibold capitalize">{getChannelTitle(channel)}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const provider = providers.find((p) => p.id === integration.providerId);
          if (!provider) return null;

          const environment = environments?.find((env) => env._id === integration._environmentId);
          if (!environment) return null;

          return (
            <IntegrationCard
              key={integration._id}
              integration={integration}
              provider={provider}
              environment={environment}
              onRowClickCallback={onRowClickCallback}
            />
          );
        })}
      </div>
    </div>
  );
}
