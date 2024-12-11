import { Button } from '@/components/primitives/button';
import { IProvider } from '@/hooks/use-providers';

interface ProviderCardProps {
  provider: IProvider;
  onClick: () => void;
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex h-[48px] w-full items-start justify-start gap-3 border-neutral-100 p-3"
    >
      <div className="flex w-full items-start justify-start gap-3">
        <div>
          <img
            src={`/static/images/providers/dark/square/${provider.id}.svg`}
            alt={provider.displayName}
            className="h-6 w-6"
            onError={(e) => {
              e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
            }}
          />
        </div>
        <div className="text-md text-foreground-950 leading-6">{provider.displayName}</div>
      </div>
    </Button>
  );
}
