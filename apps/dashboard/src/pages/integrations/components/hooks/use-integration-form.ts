import { useCallback } from 'react';
import { CHANNELS_WITH_PRIMARY, IIntegration } from '@novu/shared';
import { IntegrationFormData } from '../../types';

interface UseIntegrationFormProps {
  integration?: IIntegration;
  integrations?: IIntegration[];
}

export function useIntegrationForm({ integration, integrations }: UseIntegrationFormProps) {
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
    shouldShowPrimaryModal,
  };
}
