import { IProviderConfig } from '@novu/shared';
import { ProviderIcon } from './provider-icon';
import { Button } from '../../primitives/button';

type IntegrationListItemProps = {
  integration: IProviderConfig;
  onClick: () => void;
};

export function IntegrationListItem({ integration, onClick }: IntegrationListItemProps) {
  return (
    <Button
      onClick={onClick}
      mode="outline"
      variant="secondary"
      className="group flex h-[48px] w-full items-start justify-start gap-3 border-neutral-100 p-3 hover:bg-white"
    >
      <div className="flex w-full items-start justify-start gap-3">
        <div>
          <ProviderIcon providerId={integration.id} providerDisplayName={integration.displayName} />
        </div>
        <div className="text-md text-foreground-950 leading-6">{integration.displayName}</div>
        <Button
          variant="secondary"
          mode="outline"
          size="2xs"
          onClick={onClick}
          className="ml-auto hidden h-[24px] group-hover:block"
        >
          Connect
        </Button>
      </div>
    </Button>
  );
}
