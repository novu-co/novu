import { Loader } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import {
  RiAngularjsFill,
  RiCheckboxCircleFill,
  RiJavascriptFill,
  RiLoader3Line,
  RiNextjsFill,
  RiReactjsFill,
  RiRemixRunFill,
  RiSvelteFill,
  RiVuejsFill,
} from 'react-icons/ri';
import { useState } from 'react';
import { SnippetEditor } from '../workflow-editor/test-workflow/snippet-editor';
import { SnippetLanguage } from '../workflow-editor/test-workflow/types';
import { Button } from '../primitives/button';
import { useIntegrations } from '../../hooks/use-integrations';
import { useFetchEnvironments } from '../../context/environment/hooks';
import { useAuth } from '../../context/auth/hooks';
import { ChannelTypeEnum } from '@novu/shared';

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
  codeLanguage: SnippetLanguage;
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

            {step.code && <SnippetEditor readOnly language={step.codeLanguage as SnippetLanguage} value={step.code} />}
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
      },
      {
        title: 'Add the inbox code to your Next.js app',
        description: 'Novu uses the onNavigate prop to make your notifications navigatable in Next.js.',
        code: `'use client';
import { Novu, PopoverNotificationCenter } from '@novu/react';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
  const router = useRouter();
  
  return (
    <Novu subscriberId="YOUR_SUBSCRIBER_ID" applicationIdentifier="YOUR_APP_ID">
      <PopoverNotificationCenter
        onNotificationClick={(notification) => {
          router.push(notification.cta.data.url);
        }}
      />
    </NovuProvider>
  );
}`,
        codeLanguage: 'tsx',
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
        code: `import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useNavigate } from '@remix-run/react';

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
        code: `<script lang="ts">
  import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
  import { goto } from '$app/navigation';
</script>

<NovuProvider subscriberId="YOUR_SUBSCRIBER_ID" applicationIdentifier="YOUR_APP_ID">
  <PopoverNotificationCenter
    onNotificationClick={(notification) => {
      goto(notification.cta.data.url);
    }}
  />
</NovuProvider>`,
        codeLanguage: 'typescript',
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
        code: `import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-center',
  template: \`
    <novu-provider [subscriberId]="'YOUR_SUBSCRIBER_ID'" [applicationIdentifier]="'YOUR_APP_ID'">
      <popover-notification-center
        [onNotificationClick]="handleNotificationClick"
      ></popover-notification-center>
    </novu-provider>
  \`,
})
export class NotificationCenterComponent {
  constructor(private router: Router) {}

  handleNotificationClick = (notification: any) => {
    this.router.navigate([notification.cta.data.url]);
  };
}`,
        codeLanguage: 'typescript',
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
        code: `<script setup lang="ts">
import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleNotificationClick = (notification: any) => {
  router.push(notification.cta.data.url);
};
</script>

<template>
  <NovuProvider subscriberId="YOUR_SUBSCRIBER_ID" applicationIdentifier="YOUR_APP_ID">
    <PopoverNotificationCenter
      @notification-click="handleNotificationClick"
    />
  </NovuProvider>
</template>`,
        codeLanguage: 'typescript',
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
        code: `import { NovuProvider, PopoverNotificationCenter } from '@novu/notification-center';

const notificationCenter = new PopoverNotificationCenter({
  subscriberId: 'YOUR_SUBSCRIBER_ID',
  applicationIdentifier: 'YOUR_APP_ID',
  onNotificationClick: (notification) => {
    window.location.href = notification.cta.data.url;
  }
});

document.getElementById('notification-container').appendChild(notificationCenter);`,
        codeLanguage: 'shell',
      },
    ],
  },
];

export function InboxEmbed(): JSX.Element {
  const [selectedFramework, setSelectedFramework] = useState(frameworks.find((f) => f.selected) || frameworks[0]);
  const auth = useAuth();
  const { environments } = useFetchEnvironments({ organizationId: auth?.currentOrganization?._id });
  const { integrations } = useIntegrations({ refetchInterval: 1000, refetchOnWindowFocus: true });
  const foundIntegration = integrations?.find(
    (integration) =>
      integration._environmentId === environments?.[0]?._id && integration.channel === ChannelTypeEnum.IN_APP
  );

  function handleFrameworkSelect(framework: Framework) {
    setSelectedFramework(framework);
  }

  return (
    <main className="flex flex-col pl-[100px]">
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
                  <Button>Send Notification</Button>
                </div>

                <SnippetEditor readOnly language="shell" value={'curl -X POST https://api.novu.co/v1/events/trigger'} />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
