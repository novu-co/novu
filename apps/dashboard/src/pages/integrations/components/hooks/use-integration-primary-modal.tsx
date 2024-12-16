import { useState } from 'react';
import { CHANNELS_WITH_PRIMARY, IIntegration, ChannelTypeEnum } from '@novu/shared';
import { IntegrationFormData } from '../../types';
import { handleIntegrationError } from '../utils/handle-integration-error';

type UseIntegrationPrimaryModalProps = {
  onSubmit: (data: IntegrationFormData, skipPrimaryCheck?: boolean) => Promise<void>;
  integrations?: IIntegration[];
  integration?: IIntegration;
  channel?: ChannelTypeEnum;
  mode: 'create' | 'update';
};

export function useIntegrationPrimaryModal({
  onSubmit,
  integrations = [],
  integration,
  channel,
  mode,
}: UseIntegrationPrimaryModalProps) {
  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<IntegrationFormData | null>(null);
  const isChannelSupportPrimary = CHANNELS_WITH_PRIMARY.includes(
    integration?.channel ?? channel ?? ChannelTypeEnum.EMAIL
  );
  const shouldShowPrimaryModal = (data: IntegrationFormData) => {
    if (!channel && !integration) return false;

    const hasSameChannelActiveIntegration = integrations?.some(
      (el) =>
        (mode === 'update' ? el._id !== integration?._id : true) &&
        el.active &&
        el.channel === (integration?.channel ?? channel)
    );

    const existingPrimaryIntegration = integrations?.find(
      (el) =>
        (mode === 'update' ? el._id !== integration?._id : true) &&
        el.primary &&
        el.channel === (integration?.channel ?? channel)
    );

    if (mode === 'update') {
      const isChangingToActive = !integration?.active && data.active;
      const isChangingToInactiveAndPrimary = integration?.active && !data.active && integration?.primary;
      const isChangingToPrimary = !integration?.primary && data.primary;

      return (
        isChannelSupportPrimary &&
        (isChangingToActive || isChangingToInactiveAndPrimary || (isChangingToPrimary && existingPrimaryIntegration)) &&
        hasSameChannelActiveIntegration
      );
    }

    return (
      isChannelSupportPrimary &&
      data.active &&
      data.primary &&
      hasSameChannelActiveIntegration &&
      existingPrimaryIntegration
    );
  };

  const handleSubmitWithPrimaryCheck = async (data: IntegrationFormData) => {
    if (shouldShowPrimaryModal(data)) {
      setIsPrimaryModalOpen(true);
      setPendingData(data);

      return;
    }

    await onSubmit(data);
  };

  const handlePrimaryConfirm = async () => {
    if (pendingData) {
      try {
        await onSubmit(pendingData, true);
        setPendingData(null);
        setIsPrimaryModalOpen(false);
      } catch (error: any) {
        handleIntegrationError(error, mode);
      }
    } else {
      setIsPrimaryModalOpen(false);
    }
  };

  const existingPrimaryIntegration = integrations?.find(
    (i) =>
      (mode === 'update' ? i._id !== integration?._id : true) &&
      i.primary &&
      i.channel === (integration?.channel ?? channel)
  );

  return {
    isPrimaryModalOpen,
    setIsPrimaryModalOpen,
    isChannelSupportPrimary,
    pendingData,
    handleSubmitWithPrimaryCheck,
    handlePrimaryConfirm,
    existingPrimaryIntegration,
  };
}
