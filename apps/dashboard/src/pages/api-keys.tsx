import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useEnvironment } from '@/context/environment/hooks';
import { CopyButton } from '@/components/primitives/copy-button';
import { Card, CardContent, CardHeader } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { Form } from '@/components/primitives/form/form';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/dashboard-layout';
import { PageMeta } from '@/components/page-meta';
import { useFetchApiKeys } from '../hooks/use-fetch-api-keys';
import { ExternalLink } from '@/components/shared/external-link';
import { Container } from '../components/primitives/container';
import { HelpTooltipIndicator } from '../components/primitives/help-tooltip-indicator';
import { API_HOSTNAME } from '../config';
import { Skeleton } from '@/components/primitives/skeleton';

interface ApiKeysFormData {
  apiKey: string;
  environmentId: string;
  identifier: string;
}

export function ApiKeysPage() {
  const apiKeysQuery = useFetchApiKeys();
  const { currentEnvironment } = useEnvironment();
  const apiKeys = apiKeysQuery.data?.data;
  const isLoading = apiKeysQuery.isLoading;

  const form = useForm<ApiKeysFormData>({
    values: {
      apiKey: apiKeys?.[0]?.key ?? '',
      environmentId: currentEnvironment?._id ?? '',
      identifier: currentEnvironment?.identifier ?? '',
    },
  });

  if (!currentEnvironment) {
    return null;
  }

  const region = window.location.hostname.includes('eu') ? 'EU' : 'US';

  return (
    <>
      <PageMeta title={`API Keys for ${currentEnvironment?.name} environment`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">API Keys</h1>}>
        <Container className="flex w-full max-w-[800px] flex-col gap-6">
          <Form {...form}>
            <Card className="w-full overflow-hidden shadow-none">
              <CardHeader>
                {'<Inbox />'}
                <p className="text-foreground-500 mt-1 text-xs font-normal">
                  {'Use the public application identifier in Novu <Inbox />. '}
                  <ExternalLink href="https://docs.novu.co/inbox/overview" className="text-foreground-500">
                    Learn more
                  </ExternalLink>
                </p>
              </CardHeader>
              <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
                <div className="space-y-4 p-3">
                  <SettingField
                    label="Application Identifier"
                    tooltip={`This is unique for the ${currentEnvironment.name} environment.`}
                    value={form.getValues('identifier')}
                    isLoading={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="w-full overflow-hidden shadow-none">
              <CardHeader>
                Secret Keys
                <p className="text-foreground-500 mt-1 text-xs font-normal">
                  {'Use the secret key to authenticate your SDK requests. Keep it secure and never share it publicly. '}
                  <ExternalLink href="https://docs.novu.co/sdks/overview" className="text-foreground-500">
                    Learn more
                  </ExternalLink>
                </p>
              </CardHeader>

              <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
                <div className="space-y-4 p-3">
                  <SettingField
                    label="Secret Key"
                    tooltip="Keep it secure and never share it publicly"
                    value={form.getValues('apiKey')}
                    secret
                    isLoading={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="w-full overflow-hidden shadow-none">
              <CardHeader>
                API URLs
                <p className="text-foreground-500 mt-1 text-xs font-normal">
                  {`URLs for Novu Cloud in the ${region} region. `}
                  <ExternalLink href="https://docs.novu.co/api-reference/overview" className="text-foreground-500">
                    Learn more
                  </ExternalLink>
                </p>
              </CardHeader>
              <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
                <div className="space-y-4 p-3">
                  <SettingField
                    label="Novu API Hostname"
                    tooltip={`For Novu Cloud in the ${region} region`}
                    value={API_HOSTNAME}
                  />
                </div>
              </CardContent>
            </Card>
          </Form>
        </Container>
      </DashboardLayout>
    </>
  );
}

function SettingField({
  label,
  tooltip,
  value,
  secret = false,
  isLoading = false,
  readOnly = true,
}: SettingFieldProps) {
  const [showSecret, setShowSecret] = useState(false);

  const toggleSecretVisibility = () => {
    setShowSecret(!showSecret);
  };

  const maskSecret = (secret: string) => {
    return `${'•'.repeat(28)} ${secret.slice(-4)}`;
  };

  return (
    <div className="grid grid-cols-[1fr,400px] items-start gap-3">
      <label className={`text-foreground-950 text-xs font-medium`}>
        {label}
        {tooltip && <HelpTooltipIndicator text={tooltip} className="relative top-[5px] ml-1" />}
      </label>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-[38px] flex-1 rounded-lg" />
            {secret && <Skeleton className="h-[38px] w-[38px] rounded-lg" />}
          </>
        ) : (
          <>
            <InputField className="flex overflow-hidden pr-0">
              <Input
                className="cursor-default"
                value={secret ? (showSecret ? value : maskSecret(value ?? '')) : value}
                readOnly={readOnly}
              />
              <CopyButton size="input-right" valueToCopy={value ?? ''} />
            </InputField>

            {secret && (
              <Button
                variant="outline"
                size="icon"
                // TODO: Icon size variant is size-8 but doesn't align with the size of the input. We should fix this.
                className="size-9"
                onClick={toggleSecretVisibility}
                disabled={isLoading}
                aria-label={showSecret ? 'Hide Secret' : 'Show Secret'}
              >
                {showSecret ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
