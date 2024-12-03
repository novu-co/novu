import { useState } from 'react';
import { RiKey2Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useEnvironment } from '@/context/environment/hooks';
import { CopyButton } from '@/components/primitives/copy-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/primitives/card';
import { Button } from '@/components/primitives/button';
import { InputField } from '@/components/primitives/input';
import { Form } from '@/components/primitives/form/form';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/dashboard-layout';
import { PageMeta } from '@/components/page-meta';
import { useApiKeysQuery } from '../hooks/use-api-keys-query';

interface ApiKeysFormData {
  apiKey: string;
  environmentId: string;
  identifier: string;
}

export function ApiKeysPage() {
  const apiKeysQuery = useApiKeysQuery();
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
    return `${'•'.repeat(28)}${key.slice(-4)}`;
  };

  return (
    <>
      <PageMeta title="Environment Keys" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">API Keys</h1>}>
        <div className="flex flex-col gap-6 p-1.5 pt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,500px]">
            <Form {...form}>
              <Card>
                <CardHeader>
                  <CardTitle>Environment Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-foreground-600 text-sm font-medium">API Key</label>
                      <div className="flex items-center gap-2">
                        <InputField className="flex-1">
                          <div className="text-foreground-600">
                            <RiKey2Line className="size-4" />
                          </div>
                          <input
                            readOnly
                            value={showApiKey ? form.getValues('apiKey') : maskApiKey(form.getValues('apiKey'))}
                            className="flex-1 bg-transparent outline-none"
                          />
                        </InputField>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleApiKeyVisibility}
                          aria-label={showApiKey ? 'Hide API Key' : 'Show API Key'}
                        >
                          {showApiKey ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
                        </Button>
                        <CopyButton valueToCopy={form.getValues('apiKey')} />
                      </div>
                      <p className="text-foreground-600 text-xs">
                        Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-foreground-600 text-sm font-medium">Application Identifier</label>
                      <div className="flex items-center gap-2">
                        <InputField className="flex-1">
                          <input
                            readOnly
                            value={form.getValues('identifier')}
                            className="flex-1 bg-transparent outline-none"
                          />
                        </InputField>
                        <CopyButton valueToCopy={form.getValues('identifier')} />
                      </div>
                      <p className="text-foreground-600 text-xs">
                        The public key identifier that can be exposed to the client applications, and used to
                        authenticate UI Components
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-foreground-600 text-sm font-medium">Environment ID</label>
                      <div className="flex items-center gap-2">
                        <InputField className="flex-1">
                          <input
                            readOnly
                            value={form.getValues('environmentId')}
                            className="flex-1 bg-transparent outline-none"
                          />
                        </InputField>
                        <CopyButton valueToCopy={form.getValues('environmentId')} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Form>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiKey2Line className="size-5" />
                  Using Your API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Authentication</h3>
                  <p className="text-foreground-600 text-sm">Add your API key to the request headers:</p>
                  <pre className="bg-background-100 rounded-md p-3 text-sm">Authorization: ApiKey YOUR_API_KEY</pre>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">SDK Usage</h3>
                  <pre className="bg-background-100 overflow-x-auto rounded-md p-3 text-sm">
                    {`import { Novu } from '@novu/node'; 

const novu = new Novu(process.env['NOVU_SECRET_KEY']);

novu.trigger('workflow-id', {
  to: {
    subscriberId: '123456'
  },
  payload: {

  }
});
`}
                  </pre>
                </div>
                <a
                  href="https://docs.novu.co/api-reference/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
                >
                  View Full API Reference
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
