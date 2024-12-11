import { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/primitives/sheet';
import { ChannelTypeEnum } from '@novu/shared';
import { useProviders } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Button } from '@/components/primitives/button';
import { IntegrationConfiguration } from './integration-configuration';
import { IntegrationSheetHeader } from './integration-sheet-header';
import { IntegrationListItem } from './integration-list-item';
import { CHANNEL_TYPE_TO_STRING } from '@/utils/channels';
import { IntegrationStep } from './types';
import { useIntegrationList } from './hooks/use-integration-list';
import { useIntegrationForm } from './hooks/use-integration-form';

export interface CreateIntegrationSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

export function CreateIntegrationSidebar({ isOpened, onClose }: CreateIntegrationSidebarProps) {
  const { providers } = useProviders();
  const [selectedIntegration, setSelectedIntegration] = useState<string>();
  const [step, setStep] = useState<IntegrationStep>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const { mutateAsync: createIntegration, isPending } = useCreateIntegration();

  const { integrationsByChannel } = useIntegrationList(providers, searchQuery);
  const { executeCreate } = useIntegrationForm({
    onClose,
    createIntegration,
  });

  useEffect(() => {
    if (isOpened) {
      setSelectedIntegration(undefined);
      setStep('select');
      setSearchQuery('');
    }
  }, [isOpened]);

  const provider = providers?.find((p) => p.id === selectedIntegration);

  const onIntegrationSelect = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setStep('configure');
  };

  const onBack = () => {
    setStep('select');
    setSelectedIntegration(undefined);
  };

  const onSubmit = async (data: any) => {
    if (!provider) return;
    await executeCreate(data, provider);
  };

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
                        {integrationsByChannel[channel].map((integration) => (
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
