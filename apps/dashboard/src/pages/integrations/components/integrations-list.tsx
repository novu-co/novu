import { ChannelTypeEnum } from '@novu/shared';
import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { useProviders } from '@/hooks/use-providers';
import { cn } from '@/lib/utils';
import { ITableIntegration } from '../types';
import { Plus, Settings } from 'lucide-react';
import { useEnvironment } from '@/context/environment/hooks';
import { useFetchIntegrations } from '../../../hooks/use-fetch-integrations';
import { RiCheckboxCircleFill, RiGitBranchFill, RiStarSmileFill } from 'react-icons/ri';

interface IntegrationsListProps {
  onAddProviderClick: () => void;
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
  onChannelClick: (channel: ChannelTypeEnum) => void;
}

export function IntegrationsList({ onAddProviderClick, onRowClickCallback, onChannelClick }: IntegrationsListProps) {
  const { currentEnvironment } = useEnvironment();
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();

  if (!integrations || !providers || !currentEnvironment) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-10">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <Settings className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No integrations found</h2>
          <p className="text-muted-foreground text-sm">Add your first integration to get started</p>
        </div>
        <Button onClick={onAddProviderClick} data-test-id="add-first-integration">
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const provider = providers.find((p) => p.id === integration.providerId);
          if (!provider) return null;

          const tableIntegration: ITableIntegration = {
            integrationId: integration._id,
            name: integration.name,
            identifier: integration.identifier,
            provider: provider.displayName,
            channel: integration.channel,
            environment: currentEnvironment.name,
            active: integration.active,
          };

          return (
            <div
              key={integration._id}
              className={cn(
                'bg-card group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-3 shadow-[0px_12px_32px_0px_rgba(0,0,0,0.02),0px_0px_0px_1px_rgba(0,0,0,0.05)] transition-all',
                !integration.active && 'opacity-75 grayscale'
              )}
              onClick={() => onRowClickCallback({ original: tableIntegration })}
              data-test-id={`integration-${integration._id}-row`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-6 w-6">
                    <img
                      src={`/static/images/providers/dark/square/${provider.id}.svg`}
                      alt={provider.displayName}
                      className="h-full w-full"
                      onError={(e) => {
                        e.currentTarget.src = `//static/images/providers/dark/square/${provider.id}.png`;
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">{provider.displayName}</span>
                </div>
                {integration.primary ||
                  (integration.channel && (
                    <Badge variant={'neutral'} className="bg-feature/10 text-feature">
                      <RiStarSmileFill className="text-feature h-4 w-4" />
                      Primary
                    </Badge>
                  ))}
              </div>
              <div>
                <div className="inline-block rounded-md bg-neutral-50 px-1.5 py-0.5 font-mono text-xs leading-4 text-neutral-400">
                  {integration.identifier}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge variant={integration.active ? 'success' : 'neutral'} className="capitalize">
                  <RiCheckboxCircleFill className="text-success h-4 w-4" />
                  {integration.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="shadow-none">
                  <RiGitBranchFill className="text-warning h-4 w-4" />
                  Development
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
