import { useState } from 'react';
import { RiKey2Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useEnvironment } from '@/context/environment/hooks';
import { CopyButton } from '@/components/primitives/copy-button';
import { Card, CardContent } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { Input, InputField } from '@/components/primitives/input';
import { Form } from '@/components/primitives/form/form';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/dashboard-layout';
import { PageMeta } from '@/components/page-meta';
import { useFetchApiKeys } from '../hooks/use-fetch-api-keys';
import { ExternalLink } from '@/components/shared/external-link';

interface ApiKeysFormData {
  apiKey: string;
  environmentId: string;
  identifier: string;
}

export function ApiKeysPage() {
  const apiKeysQuery = useFetchApiKeys();
  const { currentEnvironment } = useEnvironment();
  const [showApiKey, setShowApiKey] = useState(false);
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

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const maskApiKey = (key: string) => {
    return `${'•'.repeat(28)} ${key.slice(-4)}`;
  };

  return (
    <>
      <PageMeta title={`API Keys for ${currentEnvironment?.name} environment`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">API Keys</h1>}>
        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,500px]">
            <Form {...form}>
              <Card className="shadow-none">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-foreground-600 text-sm font-medium">Secret Key</label>
                      <div className="flex items-center gap-2">
                        <InputField className="flex overflow-hidden pr-0">
                          <Input
                            className="cursor-default"
                            value={showApiKey ? form.getValues('apiKey') : maskApiKey(form.getValues('apiKey'))}
                            readOnly
                          />
                          <CopyButton size="input-right" valueToCopy={form.getValues('apiKey')} />
                        </InputField>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleApiKeyVisibility}
                          aria-label={showApiKey ? 'Hide API Key' : 'Show API Key'}
                        >
                          {showApiKey ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
                        </Button>
                      </div>
                      <p className="text-foreground-600 text-xs">
                        Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-foreground-600 text-sm font-medium">Application Identifier</label>
                      <div className="flex items-center gap-2">
                        <InputField className="flex overflow-hidden pr-0">
                          <Input className="cursor-default" value={form.getValues('identifier')} readOnly />
                          <CopyButton size="input-right" valueToCopy={form.getValues('identifier')} />
                        </InputField>
                      </div>
                      <p className="text-foreground-600 text-xs">
                        The public application identifier used for the Inbox component
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Form>
            <div className="column flex gap-2 p-6 pt-0">
              <div className="flex flex-col gap-2">
                <RiKey2Line className="h-10 w-10" />
                <h2 className="text-foreground-950 text-lg font-medium">Environment Keys</h2>
                <p className="text-foreground-400 text-md">Copy and manage your public and private keys</p>

                <ExternalLink href="https://docs.novu.co/sdks/overview" className="text-sm">
                  Read about our SDKs
                </ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
