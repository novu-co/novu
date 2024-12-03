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
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Environment Keys</h1>}>
        <div className="flex flex-col gap-6 p-1.5 pt-6">
          <Form {...form}>
            <Card className="pt-5 shadow-none">
              <CardContent className="space-y-6">
                <div className="max-w-2xl space-y-4">
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
                      The public key identifier that can be exposed to the client applications, and used to authenticate
                      UI Components
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
        </div>
      </DashboardLayout>
    </>
  );
}
