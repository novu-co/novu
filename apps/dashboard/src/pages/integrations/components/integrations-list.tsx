import { useNavigate } from 'react-router-dom';
import { ChannelTypeEnum } from '@novu/shared';
import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { useIntegrations } from '@/hooks/use-integrations';
import { useProviders } from '@/hooks/use-providers';
import { cn } from '@/lib/utils';
import { ITableIntegration } from '../types';
import { Plus, Settings } from 'lucide-react';
import { useEnvironment } from '@/context/environment/hooks';

interface IntegrationsListProps {
  onAddProviderClick: () => void;
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
  onChannelClick: (channel: ChannelTypeEnum) => void;
}

export function IntegrationsList({ onAddProviderClick, onRowClickCallback, onChannelClick }: IntegrationsListProps) {
  const { currentEnvironment } = useEnvironment();
  const { integrations } = useIntegrations();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Integration Store</h1>
          <p className="text-muted-foreground text-sm">Manage your notification channel integrations</p>
        </div>
        <Button onClick={onAddProviderClick} data-test-id="add-provider-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

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
                'bg-card hover:border-primary/20 group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border p-5 shadow-sm transition-all hover:shadow-md',
                !integration.active && 'opacity-75 grayscale'
              )}
              onClick={() => onRowClickCallback({ original: tableIntegration })}
              data-test-id={`integration-${integration._id}-row`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="relative overflow-hidden rounded-lg border bg-gradient-to-b from-white to-gray-50/50 shadow-sm">
                      <img
                        src={`/static/images/providers/dark/square/${provider.id}.svg`}
                        alt={provider.displayName}
                        className="h-12 w-12 p-2 transition-transform duration-300 will-change-transform group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
                        }}
                      />
                    </div>
                    {integration.primary && (
                      <div className="animate-in fade-in zoom-in absolute -right-1 -top-1">
                        <Badge variant="soft" className="h-5 w-5 rounded-full p-0.5">
                          ★
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium leading-none tracking-tight">{integration.name}</h3>
                    <p className="text-muted-foreground text-sm">{provider.displayName}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={integration.active ? 'success' : 'neutral'} className="capitalize">
                    {integration.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="hover:bg-muted cursor-pointer capitalize"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChannelClick(integration.channel as ChannelTypeEnum);
                    }}
                  >
                    {integration.channel}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">{integration.identifier}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClickCallback({ original: tableIntegration });
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
