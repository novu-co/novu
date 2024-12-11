import { Button } from '@/components/primitives/button';

interface IntegrationsListToolbarProps {
  onAddIntegrationClick: React.MouseEventHandler<HTMLButtonElement>;
  areIntegrationsLoading: boolean;
}

export function IntegrationsListToolbar({
  onAddIntegrationClick,
  areIntegrationsLoading,
}: IntegrationsListToolbarProps) {
  return (
    <div className="flex justify-end">
      <Button onClick={onAddIntegrationClick} disabled={areIntegrationsLoading} data-test-id="add-integration">
        Add Integration
      </Button>
    </div>
  );
}
