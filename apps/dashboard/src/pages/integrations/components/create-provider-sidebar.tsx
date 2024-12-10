import { useCallback, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { ChannelTypeEnum, CredentialsKeyEnum } from '@novu/shared';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { SecretInput } from '@/components/primitives/secret-input';
import { RiArrowLeftSLine, RiArrowRightSLine, RiInputField } from 'react-icons/ri';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/primitives/accordion';
import { Form } from '../../../components/primitives/form/form';
import { Separator } from '../../../components/primitives/separator';
import { Switch } from '../../../components/primitives/switch';
import { HelpTooltipIndicator } from '../../../components/primitives/help-tooltip-indicator';

interface CreateProviderSidebarProps {
  isOpened: boolean;
  onClose: () => void;
  scrollToChannel?: ChannelTypeEnum;
}

interface ProviderCardProps {
  provider: IProvider;
  onClick: () => void;
}

interface ProviderFormData {
  name: string;
  identifier: string;
  credentials: Record<string, string>;
  enabled: boolean;
  primary: boolean;
}

const secureCredentials = [
  CredentialsKeyEnum.ApiKey,
  CredentialsKeyEnum.ApiToken,
  CredentialsKeyEnum.SecretKey,
  CredentialsKeyEnum.Token,
  CredentialsKeyEnum.Password,
  CredentialsKeyEnum.ServiceAccount,
];

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

  const form = useForm<ProviderFormData>({
    defaultValues: {
      enabled: true,
      primary: false,
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;
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

  const onProviderSelect = useCallback(
    (providerId: string) => {
      setSelectedProvider(providerId);
      setStep('configure');
      reset({
        name: providers?.find((p: IProvider) => p.id === providerId)?.displayName ?? '',
        identifier: '',
        credentials: {},
        enabled: true,
        primary: false,
      });
    },
    [providers, reset]
  );

  const onBack = useCallback(() => {
    setStep('select');
    setSelectedProvider(undefined);
    reset();
  }, [reset]);

  const onSubmit = useCallback(
    async (data: ProviderFormData) => {
      if (!provider) return;

      try {
        await createIntegration({
          providerId: provider.id,
          channel: provider.channel,
          credentials: data.credentials,
          name: data.name,
          identifier: data.identifier,
          active: true,
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
      <SheetContent className="w-full sm:max-w-lg">
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

        {step === 'select' ? (
          <Tabs defaultValue={ChannelTypeEnum.EMAIL} className="flex-1">
            <TabsList variant="regular" className="gap-6 border-t-0 !px-3">
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
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col p-3">
              <div className="flex-1 space-y-3 overflow-y-auto pb-8">
                <Accordion type="single" collapsible value={'layout'}>
                  <AccordionItem value="layout">
                    <AccordionTrigger>
                      <div className="flex items-center gap-1 text-xs">
                        <RiInputField className="text-feature size-5" />
                        General Settings
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs" htmlFor="enabled">
                            Enable Provider{' '}
                            <HelpTooltipIndicator
                              className="relative top-1"
                              size="4"
                              text="Disabling a provider will stop sending notifications through it."
                            />
                          </Label>
                          <Switch id="enabled" {...register('enabled')} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs" htmlFor="primary">
                            Primary Provider{' '}
                            <HelpTooltipIndicator
                              className="relative top-1"
                              size="4"
                              text="Primary provider will be used for all notifications by defauly, there can be only one primary provider per channel"
                            />
                          </Label>
                          <Switch id="primary" {...register('primary')} />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="text-xs" htmlFor="name">
                            Name
                          </Label>
                          <InputField>
                            <Input id="name" {...register('name', { required: 'Name is required' })} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                          </InputField>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs" htmlFor="identifier">
                            Identifier
                          </Label>
                          <InputField>
                            <Input
                              id="identifier"
                              {...register('identifier', { required: 'Identifier is required' })}
                            />
                            {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
                          </InputField>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator />

                <Accordion type="single" collapsible value={'credentials'}>
                  <AccordionItem value="credentials">
                    <AccordionTrigger>
                      <div className="flex items-center gap-1 text-xs">
                        <RiInputField className="text-feature size-5" />
                        Provider Credentials
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="border-neutral-alpha-200 bg-background text-foreground-600 mx-0 mt-0 flex flex-col gap-2 rounded-lg border p-3">
                        {provider?.credentials?.map((credential) => (
                          <div key={credential.key} className="space-y-2">
                            <Label htmlFor={credential.key}>{credential.displayName}</Label>
                            {credential.type === 'secret' ||
                            secureCredentials.includes(credential.key as CredentialsKeyEnum) ? (
                              <InputField className="flex overflow-hidden pr-0">
                                <SecretInput
                                  id={credential.key}
                                  placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                                  register={register}
                                  registerKey={`credentials.${credential.key}`}
                                  registerOptions={{
                                    required: credential.required ? `${credential.displayName} is required` : false,
                                  }}
                                />
                              </InputField>
                            ) : (
                              <InputField>
                                <Input
                                  id={credential.key}
                                  type="text"
                                  placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                                  {...register(`credentials.${credential.key}`, {
                                    required: credential.required ? `${credential.displayName} is required` : false,
                                  })}
                                />
                              </InputField>
                            )}
                            {credential.description && (
                              <div className="text-foreground-400 flex items-center gap-1 text-xs">
                                <span>{credential.description}</span>
                              </div>
                            )}
                            {errors.credentials?.[credential.key] && (
                              <p className="text-sm text-red-500">{errors.credentials[credential.key]?.message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </form>
          </Form>
        )}
        <SheetFooter className="border-t border-neutral-200 p-0">
          <div className="flex justify-end gap-4 p-3">
            <Button type="submit" isLoading={isPending} size="sm">
              Connect Integration <RiArrowRightSLine className="size-4" />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
