import { Badge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { cn } from '@/lib/utils';
import { RiCheckboxCircleFill, RiGitBranchFill, RiStarSmileFill, RiSettings4Line } from 'react-icons/ri';
import { ITableIntegration } from '../types';
import type { IEnvironment, IIntegration, IProviderConfig } from '@novu/shared';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { ProviderIcon } from './provider-icon';
import { isDemoIntegration } from '../utils/is-demo-integration';

interface IntegrationCardProps {
  integration: IIntegration;
  provider: IProviderConfig;
  environment: IEnvironment;
  onRowClickCallback: (item: { original: ITableIntegration }) => void;
}

export function IntegrationCard({ integration, provider, environment, onRowClickCallback }: IntegrationCardProps) {
  const navigate = useNavigate();

  const tableIntegration: ITableIntegration = {
    integrationId: integration._id ?? '',
    name: integration.name,
    identifier: integration.identifier,
    provider: provider.displayName,
    channel: integration.channel,
    environment: environment.name,
    active: integration.active,
  };

  const handleConfigureClick = (e: React.MouseEvent) => {
    if (integration.channel === 'in_app' && !integration.connected) {
      e.stopPropagation();
      navigate(ROUTES.INBOX_EMBED);
    } else {
      onRowClickCallback({ original: tableIntegration });
    }
  };

  const isDemo = isDemoIntegration(provider.id);

  return (
    <div
      className={cn(
        'bg-card group relative flex cursor-pointer flex-col gap-2 overflow-hidden rounded-xl border p-3 transition-all hover:shadow-lg',
        !integration.active && 'opacity-75 grayscale'
      )}
      onClick={handleConfigureClick}
      data-test-id={`integration-${integration._id}-row`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-6 w-6">
            <ProviderIcon
              providerId={provider.id}
              providerDisplayName={provider.displayName}
              className="h-full w-full"
            />
          </div>
          <span className="text-sm font-medium">{integration.name}</span>
        </div>
        {integration.primary && (
          <Badge variant={'neutral'} className="bg-feature/10 text-feature">
            <RiStarSmileFill className="text-feature h-4 w-4" />
            Primary
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-block rounded-md bg-neutral-50 px-1.5 py-[3px] font-mono text-xs leading-4 text-neutral-400">
          {integration.identifier}
        </div>
        {isDemo && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="warning" className="h-[22px] text-xs text-[#F6B51E]">
                DEMO
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                This is a demo provider for testing purposes only and capped at 300{' '}
                {provider.channel === 'email' ? 'emails' : 'sms'} per month. Not suitable for production use.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {integration.channel === 'in_app' && !integration.connected ? (
          <Button size="xs" className="h-[26px]" variant="outline" onClick={handleConfigureClick}>
            <RiSettings4Line className="h-4 w-4" />
            Configure
          </Button>
        ) : (
          <Badge variant={integration.active ? 'success' : 'neutral'} className="capitalize">
            <RiCheckboxCircleFill className="text-success h-4 w-4" />
            {integration.active ? 'Active' : 'Inactive'}
          </Badge>
        )}
        <Badge variant="outline" className="shadow-none">
          <RiGitBranchFill
            className={cn('h-4 w-4', environment.name.toLowerCase() === 'production' ? 'text-feature' : 'text-warning')}
          />
          {environment.name}
        </Badge>
      </div>
    </div>
  );
}
