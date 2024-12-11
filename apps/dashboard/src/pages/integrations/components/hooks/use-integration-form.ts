import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import { CheckIntegrationResponseEnum } from '@/api/integrations';
import { IntegrationFormData } from '../types';
import { CHANNELS_WITH_PRIMARY, IIntegration } from '@novu/shared';
import { useUpdateIntegration } from '@/hooks/use-update-integration';
import { useSetPrimaryIntegration } from '@/hooks/use-set-primary-integration';

interface UseIntegrationFormProps {
  onClose: () => void;
  integration?: IIntegration;
  integrations?: IIntegration[];
}

export function useIntegrationForm({ onClose, integration, integrations }: UseIntegrationFormProps) {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const { mutateAsync: updateIntegration, isPending: isUpdating } = useUpdateIntegration();
  const { mutateAsync: setPrimaryIntegration, isPending: isSettingPrimary } = useSetPrimaryIntegration();

  const executeUpdate = useCallback(
    async (data: IntegrationFormData) => {
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
        handleError(error);
      }
    },
    [integration, updateIntegration, setPrimaryIntegration, queryClient, currentEnvironment?._id, onClose]
  );

  const shouldShowPrimaryModal = useCallback(
    (data: IntegrationFormData) => {
      if (!integration || !integrations) return false;

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

      return (
        isChannelSupportPrimary &&
        (isChangingToActive || isChangingToInactiveAndPrimary || (isChangingToPrimary && existingPrimaryIntegration)) &&
        hasSameChannelActiveIntegration
      );
    },
    [integration, integrations]
  );

  return {
    executeUpdate,
    shouldShowPrimaryModal,
    isUpdating,
    isSettingPrimary,
  };
}

function handleError(error: any) {
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
