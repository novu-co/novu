import { useMemo } from 'react';
import { ChannelTypeEnum, IProviderConfig } from '@novu/shared';

export function useIntegrationList(providers: IProviderConfig[] | undefined, searchQuery: string = '') {
  const filteredIntegrations = useMemo(() => {
    if (!providers) return [];

    const filtered = providers.filter(
      (provider: IProviderConfig) =>
        provider.displayName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        provider.id !== 'novu-email' &&
        provider.id !== 'novu-sms'
    );

    const popularityOrder: Record<ChannelTypeEnum, string[]> = {
      [ChannelTypeEnum.EMAIL]: [
        'sendgrid',
        'mailgun',
        'postmark',
        'mailjet',
        'mandrill',
        'ses',
        'outlook365',
        'custom-smtp',
      ],
      [ChannelTypeEnum.SMS]: ['twilio', 'plivo', 'sns', 'nexmo', 'telnyx', 'sms77', 'infobip', 'gupshup'],
      [ChannelTypeEnum.PUSH]: ['fcm', 'expo', 'apns', 'one-signal'],
      [ChannelTypeEnum.CHAT]: ['slack', 'discord', 'ms-teams', 'mattermost'],
      [ChannelTypeEnum.IN_APP]: [],
    };

    return filtered.sort((a, b) => {
      const channelOrder = popularityOrder[a.channel] || [];
      const indexA = channelOrder.indexOf(a.id);
      const indexB = channelOrder.indexOf(b.id);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return 0;
    });
  }, [providers, searchQuery]);

  const integrationsByChannel = useMemo(() => {
    return Object.values(ChannelTypeEnum).reduce(
      (acc, channel) => {
        acc[channel] = filteredIntegrations.filter((provider: IProviderConfig) => provider.channel === channel);
        return acc;
      },
      {} as Record<ChannelTypeEnum, IProviderConfig[]>
    );
  }, [filteredIntegrations]);

  return {
    filteredIntegrations,
    integrationsByChannel,
  };
}
