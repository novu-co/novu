import { useState, ReactNode } from 'react';
import { RiKey2Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
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

interface ApiKeysFormData {
  apiKey: string;
  environmentId: string;
  identifier: string;
}

export function ApiKeysPage() {
  const apiKeysQuery = useFetchApiKeys();
  const { currentEnvironment } = useEnvironment();
  const apiKeys = apiKeysQuery.data?.data;

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

  return (
    <>
      <PageMeta title={`API Keys for ${currentEnvironment?.name} environment`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">API Keys</h1>}>
        <Container>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[224px,1fr]">
            <div className="column flex gap-2 p-6 pt-0">
              <div className="flex flex-col gap-2">
                <RiKey2Line className="h-8 w-8" />
                <h2 className="text-foreground-950 text-md font-medium">Environment Keys</h2>
                <p className="text-foreground-400 text-xs">Copy and manage your public and private keys</p>

                <ExternalLink variant="documentation" href="https://docs.novu.co/sdks/overview" className="text-sm">
                  Read about our SDKs
                </ExternalLink>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <Form {...form}>
                <Card className="w-full overflow-hidden shadow-none">
                  <CardHeader>Application</CardHeader>

                  <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
                    <div className="space-y-4 p-3">
                      <SettingField label="API URL" tooltip="The base URL for making API requests to Novu">
                        <div className="flex items-center gap-2">
                          <InputField className="flex overflow-hidden pr-0">
                            <Input className="cursor-default" value={API_HOSTNAME} readOnly />
                            <CopyButton size="input-right" valueToCopy={API_HOSTNAME} />
                          </InputField>
                        </div>
                      </SettingField>

                      <SettingField
                        label="Application Identifier"
                        tooltip="This is a unique identifier for the current environment, used to initialize the Inbox component"
                      >
                        <div className="flex items-center gap-2">
                          <InputField className="flex overflow-hidden pr-0">
                            <Input className="cursor-default" value={form.getValues('identifier')} readOnly />
                            <CopyButton size="input-right" valueToCopy={form.getValues('identifier')} />
                          </InputField>
                        </div>
                      </SettingField>
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full overflow-hidden shadow-none">
                  <CardHeader>
                    Secret Keys
                    <p className="text-foreground-600 mt-1 text-xs">
                      Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                    </p>
                  </CardHeader>

                  <CardContent className="rounded-b-xl border-t bg-neutral-50 bg-white p-3">
                    <div className="space-y-4 p-3">
                      <SettingField
                        label="Secret Key"
                        tooltip="Use this key to authenticate your API requests. Keep it secure and never share it publicly."
                        value={form.getValues('apiKey')}
                        secret
                      />
                    </div>
                  </CardContent>
                </Card>
              </Form>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    </>
  );
}

interface SettingFieldProps {
  label: string;
  tooltip?: string;
  children?: ReactNode;
  value?: string;
  secret?: boolean;
}

function SettingField({ label, tooltip, children, value, secret = false }: SettingFieldProps) {
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
      <div className="space-y-2">
        {secret && value ? (
          <div className="flex items-center gap-2">
            <InputField className="flex overflow-hidden pr-0">
              <Input className="cursor-default" value={showSecret ? value : maskSecret(value)} readOnly />
              <CopyButton size="input-right" valueToCopy={value} />
            </InputField>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSecretVisibility}
              aria-label={showSecret ? 'Hide Secret' : 'Show Secret'}
            >
              {showSecret ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
            </Button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
