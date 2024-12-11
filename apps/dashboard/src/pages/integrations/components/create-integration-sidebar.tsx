import { useCallback, useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { ChannelTypeEnum, IProviderConfig } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Button } from '@/components/primitives/button';
import { IntegrationConfiguration } from './integration-configuration';
import { IntegrationSheetHeader } from './integration-sheet-header';
import { IntegrationListItem } from './integration-list-item';
import { toast } from 'sonner';
import { CheckIntegrationResponseEnum } from '../../../api/integrations';
import { CHANNEL_TYPE_TO_STRING } from '@/utils/channels';
import { QueryKeys } from '@/utils/query-keys';
import { useQueryClient } from '@tanstack/react-query';
import { useEnvironment } from '@/context/environment/hooks';

interface CreateIntegrationSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const { providers } = useProviders();
  const [selectedIntegration, setSelectedIntegration] = useState<string>();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();

  useEffect(() => {
    if (isOpened) {
      setSelectedIntegration(undefined);
      setStep('select');
      setSearchQuery('');
    }
  }, [isOpened]);

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

      // If both providers are in the popularity order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one provider is in the order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // For providers not in the order, maintain their original position
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

  const provider = providers?.find((p: IProviderConfig) => p.id === selectedIntegration);

  const onIntegrationSelect = useCallback((integrationId: string) => {
    setSelectedIntegration(integrationId);
    setStep('configure');
  }, []);

  const onBack = useCallback(() => {
    setStep('select');
    setSelectedIntegration(undefined);
  }, []);

  const onSubmit = useCallback(
    async (data: any) => {
      if (!provider) return;

      try {
        await createIntegration({
          providerId: provider.id,
          channel: provider.channel,
          credentials: data.credentials,
          name: data.name,
          identifier: data.identifier,
          active: data.active,
          primary: data.primary,
        });
        queryClient.invalidateQueries({ queryKey: [QueryKeys.fetchIntegrations, currentEnvironment?._id] });
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
          toast.error('Failed to create integration', {
            description: error?.message?.message || error?.message || 'There was an error creating the integration.',
          });
        }
      }
    },
    [createIntegration, onClose, currentEnvironment?._id, provider, queryClient]
  );

  return (
    <Sheet open={isOpened} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <IntegrationSheetHeader provider={provider} mode="create" step={step} onBack={onBack} />

        <div className="flex-1 overflow-y-auto">
          {step === 'select' ? (
            <Tabs defaultValue={ChannelTypeEnum.EMAIL} className="flex h-full flex-col">
              <TabsList variant="regular" className="bg-background sticky top-0 z-10 gap-6 border-t-0 !px-3">
                {[ChannelTypeEnum.EMAIL, ChannelTypeEnum.SMS, ChannelTypeEnum.PUSH, ChannelTypeEnum.CHAT].map(
                  (channel) => (
                    <TabsTrigger key={channel} value={channel} variant="regular" className="!px-0 !py-3">
                      {CHANNEL_TYPE_TO_STRING[channel]}
                    </TabsTrigger>
                  )
                )}
              </TabsList>

              {[ChannelTypeEnum.EMAIL, ChannelTypeEnum.SMS, ChannelTypeEnum.PUSH, ChannelTypeEnum.CHAT].map(
                (channel) => (
                  <TabsContent key={channel} value={channel} className="flex-1">
                    {integrationsByChannel[channel]?.length > 0 ? (
                      <div className="flex flex-col gap-4 p-3">
                        {integrationsByChannel[channel].map((integration: IProviderConfig) => (
                          <IntegrationListItem
                            key={integration.id}
                            integration={integration}
                            onClick={() => onIntegrationSelect(integration.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex min-h-[200px] items-center justify-center text-center">
                        {searchQuery ? (
                          <p>No {channel.toLowerCase()} integrations match your search</p>
                        ) : (
                          <p>No {channel.toLowerCase()} integrations available</p>
                        )}
                      </div>
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>
          ) : provider ? (
            <IntegrationConfiguration provider={provider} onSubmit={onSubmit} mode="create" />
          ) : null}
        </div>

        {step === 'configure' && (
          <div className="border-border bg-background mt-auto flex items-center justify-end gap-2 border-t p-4">
            <Button type="submit" form="integration-configuration-form" disabled={isPending} isLoading={isPending}>
              Create Integration
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
