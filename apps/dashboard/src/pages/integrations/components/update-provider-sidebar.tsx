import { useCallback, useState } from 'react';
import { CheckIntegrationResponseEnum } from '@novu/shared';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useUpdateIntegration } from '@/hooks/use-update-integration';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/primitives/alert-dialog';
import { useFetchIntegrations } from '../../../hooks/use-fetch-integrations';
import { ProviderConfiguration } from './provider-configuration';
import { ProviderSheetHeader } from './provider-sheet-header';
import { toast } from 'sonner';

interface UpdateProviderSidebarProps {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}

export function UpdateProviderSidebar({ isOpened, integrationId, onClose }: UpdateProviderSidebarProps) {
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();
  const { mutateAsync: updateIntegration, isPending } = useUpdateIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p: IProvider) => p.id === integration?.providerId);

  const onSubmit = useCallback(
    async (data: any) => {
      if (!integration) return;

      try {
        const response = await updateIntegration({
          integrationId: integration._id,
          data: {
            name: data.name,
            identifier: data.identifier,
            active: data.active,
            primary: data.primary,
            credentials: data.credentials,
          },
        });
        onClose();
      } catch (error: any) {
        if (error?.message?.code === CheckIntegrationResponseEnum.INVALID_EMAIL) {
          toast.error('Invalid sender email', {
            description: error.message?.message,
          });
        } else if (error?.message?.code === CheckIntegrationResponseEnum.BAD_CREDENTIALS) {
          toast.error('Invalid credentials or credentials expired', {
            description: error.message?.message,
          });
        } else {
          toast.error('Failed to update integration', {
            description: error?.message?.message || error?.message || 'There was an error updating the integration.',
          });
        }
      }
    },
    [integration, updateIntegration, onClose]
  );

  const onDelete = useCallback(async () => {
    if (!integration) return;
    // TODO: Implement delete functionality
    setIsDeleteDialogOpen(false);
    onClose();
  }, [integration, onClose]);

  if (!integration || !provider) {
    return null;
  }

  return (
    <>
      <Sheet open={isOpened} onOpenChange={onClose}>
        <SheetContent className="flex w-full flex-col sm:max-w-lg">
          <ProviderSheetHeader provider={provider} integration={integration} mode="update" />

          <ProviderConfiguration
            provider={provider}
            integration={integration}
            onSubmit={onSubmit}
            isLoading={isPending}
            mode="update"
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the integration and remove its data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete Integration</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
