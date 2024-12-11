import { useCallback, useState, useMemo } from 'react';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { ChannelTypeEnum } from '@novu/shared';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { ProviderConfiguration } from './provider-configuration';
import { ProviderSheetHeader } from './provider-sheet-header';
import { ProviderCard } from './provider-card';

interface CreateProviderSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateProviderSidebar({ isOpened, onClose }: CreateProviderSidebarProps) {
  const { providers } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<string>();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();

  const filteredProviders = useMemo(() => {
    if (!providers) return [];
    return providers.filter((provider: IProvider) =>
      provider.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [providers, searchQuery]);

  const providersByChannel = useMemo(() => {
    return Object.values(ChannelTypeEnum).reduce(
      (acc, channel) => {
        acc[channel] = filteredProviders.filter((provider: IProvider) => provider.channel === channel);
        return acc;
      },
      {} as Record<ChannelTypeEnum, IProvider[]>
    );
  }, [filteredProviders]);

  const provider = providers?.find((p: IProvider) => p.id === selectedProvider);

  const onProviderSelect = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
    setStep('configure');
  }, []);

  const onBack = useCallback(() => {
    setStep('select');
    setSelectedProvider(undefined);
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
          active: data.enabled,
          primary: data.primary,
        });
        onClose();
      } catch (error) {
        console.error('Failed to create integration:', error);
      }
    },
    [provider, createIntegration, onClose]
  );

  return (
    <Sheet open={isOpened} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <ProviderSheetHeader provider={provider} mode="create" step={step} onBack={onBack} />

        <div className="flex-1 overflow-y-auto">
          {step === 'select' ? (
            <Tabs defaultValue={ChannelTypeEnum.EMAIL} className="flex h-full flex-col">
              <TabsList variant="regular" className="bg-background sticky top-0 z-10 gap-6 border-t-0 !px-3">
                {Object.values(ChannelTypeEnum).map((channel) => (
                  <TabsTrigger key={channel} value={channel} variant="regular" className="!px-0 !py-3 capitalize">
                    {channel}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.values(ChannelTypeEnum).map((channel) => (
                <TabsContent key={channel} value={channel}>
                  {providersByChannel[channel]?.length > 0 ? (
                    <div className="flex flex-col gap-4 p-3">
                      {providersByChannel[channel].map((provider: IProvider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          onClick={() => onProviderSelect(provider.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex min-h-[200px] items-center justify-center text-center">
                      {searchQuery ? (
                        <p>No {channel.toLowerCase()} providers match your search</p>
                      ) : (
                        <p>No {channel.toLowerCase()} providers available</p>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : provider ? (
            <ProviderConfiguration provider={provider} onSubmit={onSubmit} isLoading={isPending} mode="create" />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
