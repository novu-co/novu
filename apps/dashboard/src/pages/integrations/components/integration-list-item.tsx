import { Button } from '@/components/primitives/button';
import { IProviderConfig } from '@novu/shared';

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
          <img
            src={`/images/providers/light/square/${integration.id}.svg`}
            alt={integration.displayName}
            className="h-6 w-6"
          />
        </div>
        <div className="text-md text-foreground-950 leading-6">{integration.displayName}</div>
      </div>
    </Button>
  );
}
