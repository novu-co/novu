import { Loader, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import {
  RiAngularjsFill,
  RiCheckboxCircleFill,
  RiJavascriptFill,
  RiLoader3Line,
  RiNextjsFill,
  RiNotification2Fill,
  RiReactjsFill,
  RiRemixRunFill,
  RiSvelteFill,
  RiVuejsFill,
} from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { CodeBlock, Language } from '../primitives/code-block';
import { Button } from '../primitives/button';
import { useIntegrations } from '../../hooks/use-integrations';
import { useFetchEnvironments } from '../../context/environment/hooks';
import { useAuth } from '../../context/auth/hooks';
import { ChannelTypeEnum } from '@novu/shared';
import { API_HOSTNAME, WEBSOCKET_HOSTNAME } from '../../config';
import ReactConfetti from 'react-confetti';
import { useTriggerWorkflow } from '@/hooks/use-trigger-workflow';
import { showToast } from '../primitives/sonner-helpers';
import { ToastIcon } from '../primitives/sonner';

interface Framework {
  name: string;
  icon: JSX.Element;
  selected?: boolean;
  installSteps: InstallationStep[];
}

interface InstallationStep {
  title: string;
  description: string;
  code?: string;
  codeLanguage: Language;
  codeTitle?: string;
}

function FrameworkInstructions({ framework }: { framework: Framework }) {
  return (
    <div className="flex flex-col gap-8 pl-[72px]">
      <div className="relative border-l border-[#eeeef0] p-8 pt-[24px]">
        {framework.installSteps.map((step, index) => (
          <div key={index} className="relative mt-8 flex gap-8 first:mt-0">
            {/* Step number overlay */}
            <div className="absolute -left-[43px] flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950">
              <span className="text-xs font-medium text-white">{index + 1}</span>
            </div>

            {/* Step content */}
            <div className="flex w-[344px] max-w-md flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              <p className="text-foreground-400 text-xs">{step.description}</p>
            </div>

            {step.code && (
              <div className="w-full max-w-[500px]">
                <CodeBlock
                  code={step.code}
                  language={step.codeLanguage === 'shell' ? 'shell' : step.codeLanguage}
                  title={step.codeTitle}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Updated frameworks with specific installation steps
const frameworks: Framework[] = [
  {
    name: 'Next.js',
    icon: <RiNextjsFill className="h-8 w-8 text-black" />,
    selected: true,
    installSteps: [
      {
        title: 'Install the package',
        description: '@novu/react is the package that is powering the notification center in Next.js.',
        code: 'npm install @novu/react',
        codeLanguage: 'shell',
        codeTitle: 'Terminal',
      },
      {
        title: 'Add the inbox code to your Next.js app',
        description: 'Novu uses the onNavigate prop to make your notifications navigatable in Next.js.',
        code: `'use client';

import { Inbox } from '@novu/react';
import { useRouter } from 'next/navigation';

function Novu() {
  const router = useRouter();

  return (
    <Inbox
      applicationIdentifier="YOUR_APPLICATION_IDENTIFIER"
      subscriberId="YOUR_SUBSCRIBER_ID"
      routerPush={(path: string) => router.push(path)}
    />
  );
}`,
        codeLanguage: 'tsx',
        codeTitle: 'App.tsx',
      },
    ],
  },
  {
    name: 'React',
    icon: <RiReactjsFill className="h-8 w-8 text-[#61DAFB]" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and React.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your React app',
        description: 'Novu uses the onNavigate prop to handle notification clicks in React.',
        code: `import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useNavigate } from 'react-router-dom';

export function NotificationCenter() {
  const navigate = useNavigate();
  
  return (
    <NovuProvider subscriberId="YOUR_SUBSCRIBER_ID" applicationIdentifier="YOUR_APP_ID">
      <PopoverNotificationCenter
        onNotificationClick={(notification) => {
          navigate(notification.cta.data.url);
        }}
      />
    </NovuProvider>
  );
}`,
        codeLanguage: 'typescript',
      },
    ],
  },
  {
    name: 'Remix',
    icon: <RiRemixRunFill className="h-8 w-8 text-black" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and Remix.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your Remix app',
        description: 'Implement the notification center in your Remix application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
  {
    name: 'SvelteJS',
    icon: <RiSvelteFill className="h-8 w-8 text-[#FF3E00]" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and Svelte.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your Svelte app',
        description: 'Implement the notification center in your Svelte application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
  {
    name: 'Angular',
    icon: <RiAngularjsFill className="h-8 w-8 text-[#DD0031]" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and Angular.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your Angular app',
        description: 'Implement the notification center in your Angular application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
  {
    name: 'VueJS',
    icon: <RiVuejsFill className="h-8 w-8 text-[#4FC08D]" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and Vue.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your Vue app',
        description: 'Implement the notification center in your Vue application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
  {
    name: 'JavaScript',
    icon: <RiJavascriptFill className="h-8 w-8 text-[#F7DF1E]" />,
    installSteps: [
      {
        title: 'Install',
        description: 'The npm package to use with novu and vanilla JavaScript.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
      {
        title: 'Add the inbox code to your JavaScript app',
        description: 'Implement the notification center in your vanilla JavaScript application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
];

export function InboxEmbed(): JSX.Element {
  const [selectedFramework, setSelectedFramework] = useState(frameworks.find((f) => f.selected) || frameworks[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const auth = useAuth();
  const { environments } = useFetchEnvironments({ organizationId: auth?.currentOrganization?._id });
  const { integrations } = useIntegrations({ refetchInterval: 1000, refetchOnWindowFocus: true });
  const { triggerWorkflow, isPending } = useTriggerWorkflow();

  const currentEnvironment = environments?.find((env) => !env._parentId);
  const subscriberId = auth?.currentUser?._id;

  useEffect(() => {
    if (!currentEnvironment?.identifier || !subscriberId) return;

    const isDefaultApi = API_HOSTNAME === 'https://api.novu.co';
    const isDefaultWs = WEBSOCKET_HOSTNAME === 'https://ws.novu.co';

    // Create the props string based on environment
    const additionalProps = [
      ...(isDefaultApi ? [] : [`backendUrl="${API_HOSTNAME}"`]),
      ...(isDefaultWs ? [] : [`socketUrl="${WEBSOCKET_HOSTNAME}"`]),
    ].join('\n      ');

    // Create the full Inbox component string
    const inboxComponentString = `<Inbox
      applicationIdentifier="${currentEnvironment.identifier}"
      subscriberId="${subscriberId}"
      routerPush={(path: string) => router.push(path)}${additionalProps ? '\n      ' + additionalProps : ''}
    />`;

    const updatedFrameworks = frameworks.map((framework) => ({
      ...framework,
      installSteps: framework.installSteps.map((step) => ({
        ...step,
        code: step.code
          ?.replace(/<Inbox[\s\S]*?\/>/, inboxComponentString)
          ?.replace(/YOUR_APP_ID/g, currentEnvironment.identifier),
      })),
    }));

    setSelectedFramework(updatedFrameworks.find((f) => f.name === selectedFramework.name) || updatedFrameworks[0]);
  }, [currentEnvironment?.identifier, subscriberId, selectedFramework.name]);

  const foundIntegration = integrations?.find(
    (integration) =>
      integration._environmentId === environments?.[0]?._id && integration.channel === ChannelTypeEnum.IN_APP
  );

  useEffect(() => {
    if (foundIntegration?.connected) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [foundIntegration?.connected]);

  function handleFrameworkSelect(framework: Framework) {
    setSelectedFramework(framework);
  }

  async function handleSendNotification() {
    try {
      await triggerWorkflow({
        name: 'onboarding-demo-workflow',
        to: auth.currentUser?._id,
        payload: {
          subject: '**Welcome to Inbox!**',
          body: 'This is your first notification. Customize and explore more features.',
          primaryActionLabel: 'Add to your app',
          secondaryActionLabel: '',
        },
      });

      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Notification sent successfully!</span>
          </>
        ),
        options: {
          position: 'bottom-center',
        },
      });
    } catch (error) {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to send notification</span>
          </>
        ),
        options: {
          position: 'bottom-center',
        },
      });
    }
  }

  return (
    <main className="flex flex-col pl-[100px]">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={1000} />}
      {!foundIntegration?.connected && (
        <>
          {/* Header Section */}
          <div className="flex items-start gap-4 pl-[72px]">
            <div className="flex flex-col border-l border-[#eeeef0] p-8">
              <div className="flex items-center gap-2">
                <Loader className="h-3.5 w-3.5 text-[#dd2476] [animation:spin_3s_linear_infinite]" />
                <span className="bg-gradient-to-r from-[#dd2476] to-[#ff512f] bg-clip-text text-sm font-medium text-transparent">
                  Watching for Inbox Integration
                </span>
              </div>
              <p className="text-foreground-400 text-xs">
                You're just a couple steps away from your first notification.
              </p>
            </div>
          </div>

          {/* Framework Cards */}
          <div className="flex gap-2 px-6">
            {frameworks.map((framework) => (
              <Card
                key={framework.name}
                onClick={() => handleFrameworkSelect(framework)}
                className={`flex h-[100px] w-[100px] flex-col items-center justify-center border-none p-6 shadow-none transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:cursor-pointer hover:shadow-md ${
                  framework.name === selectedFramework.name ? 'bg-neutral-100' : ''
                }`}
              >
                <CardContent className="flex flex-col items-center gap-3 p-0">
                  <span className="text-2xl">{framework.icon}</span>
                  <span className="text-sm text-[#525866]">{framework.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <FrameworkInstructions framework={selectedFramework} />
        </>
      )}

      {foundIntegration?.connected && (
        <>
          <div className="flex items-start gap-4 pl-[72px]">
            <div className="flex flex-col border-l border-[#eeeef0] p-8">
              <div className="flex items-center gap-2">
                <RiCheckboxCircleFill className="text-success h-3.5 w-3.5" />
                <span className="text-success text-sm font-medium">Amazing, you did it 🎉</span>
              </div>
              <p className="text-foreground-400 text-xs">Now, let the magic happen! Click send notification below.</p>
            </div>
          </div>

          <div className="flex flex-col gap-8 pl-[72px]">
            <div className="relative border-l border-[#eeeef0] p-8 pt-[24px]">
              <div className="relative mt-8 flex gap-8 first:mt-0">
                {/* Step number overlay */}
                <div className="absolute -left-[43px] flex h-5 w-5 items-center justify-center rounded-full bg-white">
                  <RiLoader3Line className="h-4 w-4 text-neutral-300" />
                </div>

                {/* Step content */}
                <div className="flex w-[344px] max-w-md flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Let the magic happen 🪄</span>
                  </div>
                  <p className="text-foreground-400 text-xs">
                    Now, trigger a notification to see it pop up in your app! If it doesn’t appear, double-check that
                    the subscriberId matches as above.
                  </p>
                  <div>
                    <Button size="sm" className="gap-1 px-2" onClick={handleSendNotification} disabled={isPending}>
                      {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RiNotification2Fill className="h-3 w-3" />
                      )}
                      Send notification
                    </Button>
                  </div>
                </div>

                <div className="w-full max-w-[500px]">
                  <CodeBlock
                    secretMask={[{ line: 2, maskStart: 26, maskEnd: 37 }]}
                    code={`curl -X POST 'https://api.novu.co/v1/events/trigger' \

-H 'Authorization: ApiKey NOVU_SECRET_KEY' \

-H 'Content-Type: application/json' \

-d '{
  "name": "onboarding_workflow",
  "to": {
    "subscriberId": "657c929208be7e008a458508"
  },
  "payload": {
    "userName": "Naveen",
    "organizationProfile": "https://lh3.googleusercontent.com/a/AEdFTp5OW-iWTevL6YlYHpaZ6z-D0pVXE0V_7Z9Dgp12=s100",
  }
}'`}
                    language="shell"
                    title="Terminal"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
