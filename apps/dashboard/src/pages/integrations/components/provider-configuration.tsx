import { useForm, Controller } from 'react-hook-form';
import { Input, InputField } from '@/components/primitives/input';
import { Label } from '@/components/primitives/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion';
import { Form } from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import { Switch } from '@/components/primitives/switch';
import { HelpTooltipIndicator } from '@/components/primitives/help-tooltip-indicator';
import { SecretInput } from '@/components/primitives/secret-input';
import { RiInputField } from 'react-icons/ri';
import { Info } from 'lucide-react';
import { CredentialsKeyEnum, IIntegration, IProviderConfig } from '@novu/shared';
import { useEffect } from 'react';
import { InlineToast } from '../../../components/primitives/inline-toast';

const secureCredentials = [
  CredentialsKeyEnum.ApiKey,
  CredentialsKeyEnum.ApiToken,
  CredentialsKeyEnum.SecretKey,
  CredentialsKeyEnum.Token,
  CredentialsKeyEnum.Password,
  CredentialsKeyEnum.ServiceAccount,
];

interface ProviderFormData {
  name: string;
  identifier: string;
  credentials: Record<string, string>;
  active: boolean;
  primary: boolean;
}

interface ProviderConfigurationProps {
  provider: IProviderConfig;
  integration?: IIntegration;
  onSubmit: (data: ProviderFormData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'update';
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProviderConfiguration({
  provider,
  integration,
  onSubmit,
  isLoading,
  mode,
}: ProviderConfigurationProps) {
  const form = useForm<ProviderFormData>({
    defaultValues: integration
      ? {
          name: integration.name,
          identifier: integration.identifier,
          active: integration.active,
          primary: integration.primary ?? false,
          credentials: integration.credentials as Record<string, string>,
        }
      : {
          name: provider.displayName,
          identifier: generateSlug(provider.displayName),
          active: true,
          primary: false,
          credentials: {},
        },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const name = watch('name');

  useEffect(() => {
    if (mode === 'create') {
      setValue('identifier', generateSlug(name));
    }
  }, [name, mode, setValue]);

  return (
    <Form {...form}>
      <form id="provider-configuration-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-3 p-3">
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
                  <Label className="text-xs" htmlFor="active">
                    Enable Provider{' '}
                    <HelpTooltipIndicator
                      className="relative top-1"
                      size="4"
                      text="Disabling a provider will stop sending notifications through it."
                    />
                  </Label>
                  <Controller
                    control={control}
                    name="active"
                    render={({ field: { onChange, value } }) => (
                      <Switch id="active" checked={value} onCheckedChange={onChange} />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs" htmlFor="primary">
                    Primary Provider{' '}
                    <HelpTooltipIndicator
                      className="relative top-1"
                      size="4"
                      text="Primary provider will be used for all notifications by default, there can be only one primary provider per channel"
                    />
                  </Label>
                  <Controller
                    control={control}
                    name="primary"
                    render={({ field: { onChange, value } }) => (
                      <Switch id="primary" checked={value} onCheckedChange={onChange} />
                    )}
                  />
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
                    <Input id="identifier" {...register('identifier', { required: 'Identifier is required' })} />
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
                    <Label htmlFor={credential.key}>
                      {credential.displayName}
                      {credential.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {credential.type === 'switch' ? (
                      <div className="flex items-center justify-between gap-2">
                        <Controller
                          control={control}
                          name={`credentials.${credential.key}`}
                          render={({ field: { onChange, value } }) => (
                            <Switch id={credential.key} checked={Boolean(value)} onCheckedChange={onChange} />
                          )}
                        />
                      </div>
                    ) : credential.type === 'secret' ||
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <InlineToast
          variant={'tip'}
          title="Configure Provider"
          description="To learn more about how to configure your provider, please refer to the documentation."
          ctaLabel="View Guide"
          onCtaClick={() => {
            window.open(provider.docReference, '_blank');
          }}
        />
      </form>
    </Form>
  );
}
