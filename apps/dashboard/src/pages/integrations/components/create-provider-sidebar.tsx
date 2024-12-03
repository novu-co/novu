import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/primitives/sheet';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { ChannelTypeEnum, CredentialsKeyEnum } from '@novu/shared';
import { useProviders, IProvider } from '@/hooks/use-providers';
import { useCreateIntegration } from '@/hooks/use-create-integration';
import { ArrowLeft, Check, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecretInput } from '@/components/primitives/secret-input';

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
    <button
      onClick={onClick}
      className="bg-card hover:border-primary/20 focus:ring-primary/20 group relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2"
    >
      <div className="relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm transition-transform duration-200 group-hover:scale-105">
        <img
          src={`/static/images/providers/dark/square/${provider.id}.svg`}
          alt={provider.displayName}
          className="h-10 w-10"
          onError={(e) => {
            e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
          }}
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{provider.displayName}</div>
          <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="text-muted-foreground text-sm">{provider.description ?? ''}</div>
      </div>
    </button>
  );
}

export function CreateProviderSidebar({ isOpened, onClose, scrollToChannel }: CreateProviderSidebarProps) {
  const { providers } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<string>();
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const { mutateAsync: createIntegration, isLoading } = useCreateIntegration();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProviderFormData>();

  const provider = providers?.find((p: IProvider) => p.id === selectedProvider);

  const onProviderSelect = useCallback(
    (providerId: string) => {
      setSelectedProvider(providerId);
      setStep('configure');
      reset({
        name: providers?.find((p: IProvider) => p.id === providerId)?.displayName ?? '',
        identifier: '',
        credentials: {},
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
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="space-y-1 pb-6">
          {step === 'configure' && provider && (
            <Button variant="ghost" size="sm" className="hover:bg-muted -ml-2 -mt-2 h-9 px-2" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <SheetTitle>{step === 'select' ? 'Add Integration' : 'Configure Integration'}</SheetTitle>
          {step === 'select' ? (
            <p className="text-muted-foreground text-sm">Select a provider to integrate with your application.</p>
          ) : provider ? (
            <div className="flex items-center gap-4">
              <div className="relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm">
                <img
                  src={`/static/images/providers/dark/square/${provider.id}.svg`}
                  alt={provider.displayName}
                  className="h-10 w-10"
                  onError={(e) => {
                    e.currentTarget.src = `/static/images/providers/dark/square/${provider.id}.png`;
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="font-medium leading-none">{provider.displayName}</div>
                <p className="text-muted-foreground text-sm">{provider.channel} Provider</p>
              </div>
            </div>
          ) : null}
        </SheetHeader>

        {step === 'select' ? (
          <div className="flex flex-1 flex-col gap-6">
            <Tabs defaultValue={scrollToChannel ?? ChannelTypeEnum.EMAIL}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value={ChannelTypeEnum.EMAIL}>Email</TabsTrigger>
                <TabsTrigger value={ChannelTypeEnum.SMS}>SMS</TabsTrigger>
                <TabsTrigger value={ChannelTypeEnum.PUSH}>Push</TabsTrigger>
                <TabsTrigger value={ChannelTypeEnum.CHAT}>Chat</TabsTrigger>
              </TabsList>

              {Object.values(ChannelTypeEnum).map((channel) => (
                <TabsContent key={channel} value={channel} className="space-y-4 py-4">
                  {providers
                    ?.filter((provider: IProvider) => provider.channel === channel)
                    .map((provider: IProvider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        onClick={() => onProviderSelect(provider.id)}
                      />
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pb-8">
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-medium">General Settings</h3>
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="My Email Provider"
                        className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('name', { required: 'Name is required' })}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="identifier">Identifier</Label>
                      <Input
                        id="identifier"
                        placeholder="my-email-provider"
                        className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('identifier', { required: 'Identifier is required' })}
                      />
                      {errors.identifier && <p className="text-sm text-red-500">{errors.identifier.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {provider && (
                <div className="space-y-4">
                  <h3 className="text-muted-foreground text-sm font-medium">Provider Credentials</h3>
                  <div className="space-y-4 rounded-lg border p-4">
                    {provider.credentials.map((credential) => (
                      <div key={credential.key} className="space-y-2">
                        <Label htmlFor={credential.key}>{credential.displayName}</Label>
                        {credential.type === 'secret' ||
                        secureCredentials.includes(credential.key as CredentialsKeyEnum) ? (
                          <SecretInput
                            id={credential.key}
                            placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                            register={register}
                            registerKey={`credentials.${credential.key}`}
                            registerOptions={{
                              required: credential.required ? `${credential.displayName} is required` : false,
                            }}
                          />
                        ) : (
                          <Input
                            id={credential.key}
                            type="text"
                            placeholder={`Enter ${credential.displayName.toLowerCase()}`}
                            className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register(`credentials.${credential.key}`, {
                              required: credential.required ? `${credential.displayName} is required` : false,
                            })}
                          />
                        )}
                        {credential.description && (
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Info className="h-3 w-3" />
                            <span>{credential.description}</span>
                          </div>
                        )}
                        {errors.credentials?.[credential.key] && (
                          <p className="text-sm text-red-500">{errors.credentials[credential.key]?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isDirty || isLoading}>
                  {isLoading ? (
                    'Creating...'
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Create Integration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
