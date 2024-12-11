import { ReactNode } from 'react';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { IntegrationSheetHeader } from './integration-sheet-header';
import { IProviderConfig } from '@novu/shared';

interface IntegrationSheetProps {
  isOpened: boolean;
  onClose: () => void;
  provider?: IProviderConfig;
  mode: 'create' | 'update';
  step?: 'select' | 'configure';
  onBack?: () => void;
  children: ReactNode;
  maxWidth?: 'lg' | 'xl';
}

export function IntegrationSheet({
  isOpened,
  onClose,
  provider,
  mode,
  step,
  onBack,
  children,
  maxWidth = 'lg',
}: IntegrationSheetProps) {
  return (
    <Sheet open={isOpened} onOpenChange={onClose}>
      <SheetContent className={`flex w-full flex-col sm:max-w-${maxWidth}`}>
        <IntegrationSheetHeader provider={provider} mode={mode} step={step} onBack={onBack} />
        {children}
      </SheetContent>
    </Sheet>
  );
}
