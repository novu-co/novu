import { useState } from 'react';
import { toast } from 'sonner';
import { useFetchIntegrations } from '@/hooks/use-fetch-integrations';
import { useProviders } from '@/hooks/use-providers';
import { useDeleteIntegration } from '@/hooks/use-delete-integration';
import { IntegrationFormData } from './types';
import { useIntegrationForm } from './hooks/use-integration-form';
import { IntegrationConfiguration } from './integration-configuration';
import { Button } from '@/components/primitives/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/primitives/dialog';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { IntegrationSheetHeader } from './integration-sheet-header';

interface UpdateIntegrationSidebarProps {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}

export function UpdateIntegrationSidebar({ isOpened, integrationId, onClose }: UpdateIntegrationSidebarProps) {
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();
  const { deleteIntegration, isLoading: isDeleting } = useDeleteIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<IntegrationFormData | null>(null);

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p) => p.id === integration?.providerId);
  const existingPrimaryIntegration = integrations?.find(
    (i) => i.primary && i.channel === integration?.channel && i._id !== integration?._id
  );

  const { executeUpdate, shouldShowPrimaryModal, isUpdating, isSettingPrimary } = useIntegrationForm({
    onClose,
    integration,
    integrations,
  });

  const handleSubmit = async (data: IntegrationFormData) => {
    if (shouldShowPrimaryModal(data)) {
      setIsPrimaryModalOpen(true);
      setPendingUpdate(data);

      return;
    }

    await executeUpdate(data);
  };

  const handlePrimaryConfirm = async () => {
    if (pendingUpdate) {
      await executeUpdate(pendingUpdate);
      setPendingUpdate(null);
    }
    setIsPrimaryModalOpen(false);
  };

  const onDelete = async () => {
    if (!integration) return;

    try {
      await deleteIntegration({ id: integration._id });
      toast.success('Integration deleted successfully');
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      toast.error('Failed to delete integration', {
        description: error?.message || 'There was an error deleting the integration.',
      });
    }
  };

  if (!integration || !provider) return null;

  return (
    <>
      <Sheet open={isOpened} onOpenChange={onClose}>
        <SheetContent className="flex w-full flex-col sm:max-w-xl">
          <IntegrationSheetHeader provider={provider} mode="update" />

          <div className="scrollbar-custom flex-1 overflow-y-auto">
            <IntegrationConfiguration
              provider={provider}
              integration={integration}
              onSubmit={handleSubmit}
              mode="update"
            />
          </div>

          <div className="bg-background flex justify-between gap-2 border-t p-3">
            {!integration.primary && (
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete Integration
              </Button>
            )}
            <Button
              type="submit"
              form="integration-configuration-form"
              className="ml-auto"
              isLoading={isUpdating || isSettingPrimary}
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this integration?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrimaryModalOpen} onOpenChange={setIsPrimaryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Primary Integration</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to change the primary integration from{' '}
            <strong>{existingPrimaryIntegration?.name}</strong> to <strong>{integration.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrimaryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrimaryConfirm} isLoading={isUpdating || isSettingPrimary}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
