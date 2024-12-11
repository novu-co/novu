import { Button } from '@/components/primitives/button';
import { SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { IProvider } from '@/hooks/use-providers';
import { IIntegration } from '@novu/shared';

interface ProviderSheetHeaderProps {
  provider?: IProvider;
  integration?: IIntegration;
  mode: 'create' | 'update';
  onBack?: () => void;
  step?: 'select' | 'configure';
}

export function ProviderSheetHeader({ provider, integration, mode, onBack, step }: ProviderSheetHeaderProps) {
  if (mode === 'create' && step === 'select') {
    return (
      <SheetHeader className="borde-neutral-300 space-y-1 border-b p-3">
        <SheetTitle className="text-lg">Connect Provider</SheetTitle>
        <p className="text-foreground-400 text-xs">Select a provider to integrate with your application.</p>
      </SheetHeader>
    );
  }

  if (!provider) return null;

  return (
    <SheetHeader className="borde-neutral-300 space-y-1 border-b p-3">
      <div className="flex items-center gap-2">
        {mode === 'create' && onBack && (
          <Button variant="ghost" size="xs" className="text-foreground-950 h-5 p-0.5 leading-none" onClick={onBack}>
            <RiArrowLeftSLine className="h-4 w-4" />
          </Button>
        )}
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
    </SheetHeader>
  );
}
