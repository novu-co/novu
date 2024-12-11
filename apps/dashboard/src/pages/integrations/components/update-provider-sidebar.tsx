import { useCallback, useState } from 'react';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { useProviders } from '@/hooks/use-providers';
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
import { CheckIntegrationResponseEnum } from '../../../api/integrations';
import { CHANNELS_WITH_PRIMARY, IProviderConfig } from '@novu/shared';
import { useSetPrimaryIntegration } from '../../../hooks/use-set-primary-integration';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '../../../utils/query-keys';
import { useEnvironment } from '../../../context/environment/hooks';
import { Button } from '@/components/primitives/button';
import { RiArrowRightSLine } from 'react-icons/ri';

interface UpdateProviderSidebarProps {
  isOpened: boolean;
  integrationId?: string;
  onClose: () => void;
}

interface SelectPrimaryIntegrationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  currentPrimaryName?: string;
  newPrimaryName?: string;
}

function SelectPrimaryIntegrationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  currentPrimaryName,
  newPrimaryName,
}: SelectPrimaryIntegrationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Primary Integration</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              This will change the primary integration from <span className="font-medium">{currentPrimaryName}</span> to{' '}
              <span className="font-medium">{newPrimaryName}</span>.
            </p>
            <p>
              The current primary integration will be disabled and all future notifications will be sent through the new
              primary integration.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UpdateProviderSidebar({ isOpened, integrationId, onClose }: UpdateProviderSidebarProps) {
  const { integrations } = useFetchIntegrations();
  const { providers } = useProviders();
  const { mutateAsync: updateIntegration, isPending } = useUpdateIntegration();
  const { mutateAsync: setPrimaryIntegration } = useSetPrimaryIntegration();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();

  const integration = integrations?.find((i) => i._id === integrationId);
  const provider = providers?.find((p: IProviderConfig) => p.id === integration?.providerId);

  const executeUpdate = async (data: any) => {
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

      if (data.primary) {
        await setPrimaryIntegration({ integrationId: integration._id });
      }

      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id],
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
  };

  const onSubmit = useCallback(
    async (data: any) => {
      if (!integration) return;

      const hasSameChannelActiveIntegration = integrations?.some(
        (el) => el._id !== integration._id && el.active && el.channel === integration.channel
      );

      const isChangingToActive = !integration.active && data.active;
      const isChangingToInactiveAndPrimary = integration.active && !data.active && integration.primary;
      const isChangingToPrimary = !integration.primary && data.primary;
      const isChannelSupportPrimary = CHANNELS_WITH_PRIMARY.includes(integration.channel);
      const existingPrimaryIntegration = integrations?.find(
        (el) => el._id !== integration._id && el.primary && el.channel === integration.channel
      );

      if (
        isChannelSupportPrimary &&
        (isChangingToActive || isChangingToInactiveAndPrimary || (isChangingToPrimary && existingPrimaryIntegration)) &&
        hasSameChannelActiveIntegration
      ) {
        setPendingUpdate({
          ...data,
          primary: isChangingToActive ? true : data.primary,
        });
        setIsPrimaryModalOpen(true);
        return;
      }

      await executeUpdate(data);
    },
    [integration, integrations]
  );

  const handlePrimaryConfirm = useCallback(async () => {
    if (pendingUpdate) {
      await executeUpdate(pendingUpdate);
      setPendingUpdate(null);
    }
    setIsPrimaryModalOpen(false);
  }, [pendingUpdate]);

  const onDelete = useCallback(async () => {
    if (!integration) return;
    // TODO: Implement delete functionality
    setIsDeleteDialogOpen(false);
    onClose();
  }, [integration, onClose]);

  if (!integration || !provider) {
    return null;
  }

  const existingPrimaryIntegration = integrations?.find(
    (el) => el._id !== integration._id && el.primary && el.channel === integration.channel
  );

  return (
    <>
      <Sheet open={isOpened} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-lg">
          <div className="flex h-full flex-col">
            <ProviderSheetHeader provider={provider} integration={integration} mode="update" />
            <div className="scrollbar-custom min-h-0 flex-1 overflow-y-auto">
              <ProviderConfiguration
                provider={provider}
                integration={integration}
                onSubmit={onSubmit}
                isLoading={isPending}
                mode="update"
              />
            </div>
            <div className="flex-shrink-0 border-t border-neutral-200 bg-white p-3">
              <div className="flex justify-end gap-4">
                <Button type="submit" form="provider-configuration-form" isLoading={isPending} size="sm">
                  Save Changes <RiArrowRightSLine className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <SelectPrimaryIntegrationModal
        isOpen={isPrimaryModalOpen}
        onOpenChange={setIsPrimaryModalOpen}
        onConfirm={handlePrimaryConfirm}
        currentPrimaryName={existingPrimaryIntegration?.name}
        newPrimaryName={integration?.name}
      />
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
