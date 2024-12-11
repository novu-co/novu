import { useCallback, useState } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/primitives/sheet';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useUpdateIntegration } from '@/hooks/use-update-integration';
import { Badge } from '@/components/primitives/badge';
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
        await updateIntegration({
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
      } catch (error) {
        console.error('Failed to update integration:', error);
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
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-4">
              <div className="relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
                <img
                  src={`/static/images/providers/dark/square/${provider.id}.svg`}
                  alt={provider.displayName}
                  className="h-10 w-10"
                  onError={(e) => {
                    e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">{provider.displayName}</div>
                <div className="flex gap-2">
                  <Badge variant="outline">{integration.channel}</Badge>
                  {integration.active ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="neutral">Inactive</Badge>
                  )}
                  {integration.primary && <Badge variant="soft">Primary</Badge>}
                </div>
              </div>
            </div>
          </SheetHeader>

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
