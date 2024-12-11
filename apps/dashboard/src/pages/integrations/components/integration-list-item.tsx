import { Button } from '@/components/primitives/button';
import { IProviderConfig } from '@novu/shared';
import { ProviderIcon } from './provider-icon';

interface IntegrationListItemProps {
  integration: IProviderConfig;
  onClick: () => void;
}

export function IntegrationListItem({ integration, onClick }: IntegrationListItemProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex h-[48px] w-full items-start justify-start gap-3 border-neutral-100 p-3"
    >
      <div className="flex w-full items-start justify-start gap-3">
        <div>
          <ProviderIcon providerId={integration.id} providerDisplayName={integration.displayName} />
        </div>
        <div className="text-md text-foreground-950 leading-6">{integration.displayName}</div>
      </div>
    </Button>
  );
}
