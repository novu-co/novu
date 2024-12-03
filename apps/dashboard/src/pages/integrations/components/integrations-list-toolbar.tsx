import { Button } from '@/components/primitives/button';

interface IntegrationsListToolbarProps {
  onAddProviderClick: React.MouseEventHandler<HTMLButtonElement>;
  areIntegrationsLoading: boolean;
}

export function IntegrationsListToolbar({ onAddProviderClick, areIntegrationsLoading }: IntegrationsListToolbarProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onAddProviderClick} disabled={areIntegrationsLoading} data-test-id="add-provider">
        Add Provider
      </Button>
    </div>
  );
}
