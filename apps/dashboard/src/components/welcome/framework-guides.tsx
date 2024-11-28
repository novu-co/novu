import { RiJavascriptFill, RiNextjsFill, RiReactjsFill, RiRemixRunFill } from 'react-icons/ri';
import { Language } from '../primitives/code-block';
import { CodeBlock } from '../primitives/code-block';

export interface Framework {
  name: string;
  icon: JSX.Element;
  selected?: boolean;
  installSteps: InstallationStep[];
}

export interface InstallationStep {
  title: string;
  description: string;
  code?: string;
  codeLanguage: Language;
  codeTitle?: string;
}

export function FrameworkInstructions({ framework }: { framework: Framework }) {
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

// Add common installation steps
export const commonInstallStep = (packageName: string): InstallationStep => ({
  title: 'Install the package',
  description: `${packageName} is the package that powers the notification center.`,
  code: `npm install ${packageName}`,
  codeLanguage: 'shell',
  codeTitle: 'Terminal',
});

// Updated frameworks with reused installation steps
export const frameworks: Framework[] = [
  {
    name: 'Next.js',
    icon: <RiNextjsFill className="h-8 w-8 text-black" />,
    selected: true,
    installSteps: [
      commonInstallStep('@novu/react'),
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
      commonInstallStep('@novu/notification-center'),
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
      commonInstallStep('@novu/react'),
      {
        title: 'Add the inbox code to your Remix app',
        description: 'Implement the notification center in your Remix application.',
        code: `import { Inbox } from '@novu/react';
import { useNavigate } from '@remix-run/react';

function Novu() {
  const navigate = useNavigate();

  return (
    <Inbox
      applicationIdentifier="YOUR_APPLICATION_IDENTIFIER"
      subscriberId="YOUR_SUBSCRIBER_ID"
      routerPush={(path: string) => navigate(path)}
    />
  );
}`,
        codeLanguage: 'typescript',
      },
    ],
  },
  {
    name: 'JavaScript',
    icon: <RiJavascriptFill className="h-8 w-8 text-[#F7DF1E]" />,
    installSteps: [
      commonInstallStep('@novu/js'),
      {
        title: 'Add the inbox code to your JavaScript app',
        description: 'Implement the notification center in your vanilla JavaScript application.',
        code: 'npm install @novu/notification-center',
        codeLanguage: 'shell',
      },
    ],
  },
];
