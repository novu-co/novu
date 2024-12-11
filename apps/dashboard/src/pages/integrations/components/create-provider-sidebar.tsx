import { useCallback, useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { Button } from '@/components/primitives/button';
import { ChannelTypeEnum } from '@novu/shared';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { RiArrowLeftSLine } from 'react-icons/ri';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { ProviderConfiguration } from './provider-configuration';

interface CreateProviderSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

interface ProviderCardProps {
  provider: IProvider;
  onClick: () => void;
}

function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex h-[48px] w-full items-start justify-start gap-3 border-neutral-100 p-3"
    >
      <div className="flex w-full items-start justify-start gap-3">
        <div>
          <img
            src={`/static/images/providers/dark/square/${provider.id}.svg`}
            alt={provider.displayName}
            className="h-6 w-6"
            onError={(e) => {
              e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
            }}
          />
        </div>
        <div className="text-md text-foreground-950 leading-6">{provider.displayName}</div>
      </div>
    </Button>
  );
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
        <SheetHeader className={'borde-neutral-300 space-y-1 border-b ' + (step === 'select' ? 'p-3' : 'p-3.5')}>
          {step === 'select' ? <SheetTitle className="text-lg">Connect Provider</SheetTitle> : null}
          {step === 'select' ? (
            <p className="text-foreground-400 text-xs">Select a provider to integrate with your application.</p>
          ) : provider ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="xs" className="text-foreground-950 h-5 p-0.5 leading-none" onClick={onBack}>
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
              <div>
                <img
                  src={`/static/images/providers/dark/square/${provider.id}.svg`}
                  alt={provider.displayName}
                  className="h-6 w-6"
                  onError={(e) => {
                    e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
                  }}
                />
              </div>
              <div className="text-md text-foreground-950 leading-6">{provider.displayName}</div>
            </div>
          ) : null}
        </SheetHeader>

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
