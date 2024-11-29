import { RiAngularjsFill, RiJavascriptFill, RiNextjsFill, RiReactjsFill, RiRemixRunFill } from 'react-icons/ri';
import { Language } from '../primitives/code-block';
import { CodeBlock } from '../primitives/code-block';
import { InlineToast } from '../primitives/inline-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  tip?: {
    title?: string;
    description: string | React.ReactNode;
  };
}

// First, let's add the reusable tip at the top of the file, after the interfaces
const customizationTip = {
  title: 'Tip:',
  description: (
    <>
      You can customise your inbox to match your app theme,{' '}
      <a href="https://docs.novu.co/inbox/react/styling#appearance-prop" target="_blank" className="underline">
        learn more
      </a>
      .
    </>
  ),
};

export function FrameworkInstructions({ framework }: { framework: Framework }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={framework.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-8 pl-[72px]"
      >
        <div className="relative border-l border-[#eeeef0] p-8 pt-[24px]">
          {framework.installSteps.map((step, index) => (
            <motion.div
              key={`${framework.name}-step-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.15,
                delay: index * 0.05,
                ease: 'easeOut',
              }}
              className="relative mt-8 flex gap-8 first:mt-0"
            >
              {/* Step number overlay */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                className="absolute -left-[43px] flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950"
              >
                <span className="text-xs font-medium text-white">{index + 1}</span>
              </motion.div>

              {/* Step content */}
              <div className="flex w-[344px] max-w-md flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
                <p className="text-foreground-400 text-xs">{step.description}</p>
                {step.tip && <InlineToast variant="tip" title={step.tip.title} description={step.tip.description} />}
              </div>

              {step.code && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: 'easeOut',
                  }}
                  className="w-full max-w-[500px]"
                >
                  <CodeBlock
                    code={step.code}
                    language={step.codeLanguage === 'shell' ? 'shell' : step.codeLanguage}
                    title={step.codeTitle}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
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
        description: 'Novu uses the router hook to make your notifications navigatable in Next.js.',
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
        codeTitle: 'Inbox.tsx',
        tip: customizationTip,
      },
    ],
  },

  {
    name: 'React',
    icon: <RiReactjsFill className="h-8 w-8 text-[#61DAFB]" />,
    installSteps: [
      commonInstallStep('@novu/react'),
      {
        title: 'Add the inbox code to your React app',
        description: 'Novu uses the onNavigate prop to handle notification clicks in React.',
        code: `import { Inbox } from '@novu/react';
import { useNavigate } from 'react-router-dom';

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
        codeLanguage: 'tsx',
        codeTitle: 'Inbox.tsx',
        tip: customizationTip,
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
        codeLanguage: 'tsx',
        codeTitle: 'Inbox.tsx',
        tip: customizationTip,
      },
    ],
  },
  {
    name: 'Native',
    icon: <RiReactjsFill className="h-8 w-8 text-black" />,
    installSteps: [
      commonInstallStep('@novu/react-native'),
      {
        title: 'Add the inbox code to your React Native app',
        description: 'Implement the notification center in your React Native application.',
        code: `import { NovuProvider } from '@novu/react-native';
import { YourCustomInbox } from './Inbox';

function Layout() {
  return (
     <NovuProvider
      subscriberId="YOUR_SUBSCRIBER_ID"
      applicationIdentifier="YOUR_APPLICATION_IDENTIFIER"
    >
      <YourCustomInbox />
    </NovuProvider>
  );
}`,
        codeLanguage: 'tsx',
        codeTitle: 'App.tsx',
      },
      {
        title: 'Build your custom inbox component',
        description: 'Build your custom inbox component to use within your app.',
        code: `import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNotifications, Notification } from "@novu/react-native";

export function YourCustomInbox() {
   const { notifications, isLoading, fetchMore, hasMore, refetch } = useNotifications();

  const renderItem = ({ item }) => (  
    <View>
      <Text>{item.body}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View>
      <Text>No updates available</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      onEndReached={fetchMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={["#2196F3"]}
        />
      }
    />
  );
}`,
        codeLanguage: 'tsx',
        codeTitle: 'Inbox.tsx',
      },
    ],
  },
  {
    name: 'Angular',
    icon: <RiAngularjsFill className="h-8 w-8 text-[#DD0031]" />,
    installSteps: [
      commonInstallStep('@novu/js'),
      {
        title: 'Add the inbox code to your Angular app',
        description: 'Currently, angular applications are supported with the Novu UI library.',
        code: `import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NovuUI } from '@novu/js/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('notificationInbox') notificationInbox!: ElementRef<HTMLElement>;
  title = 'inbox-angular';

  ngAfterViewInit() {
    const novu = new NovuUI({
      options: {
        applicationIdentifier: '123',
        subscriberId: '456',
      },
    });

    novu.mountComponent({
      name: 'Inbox',
      props: {},
      element: this.notificationInbox.nativeElement,
    });
  }
}`,
        codeLanguage: 'typescript',
        tip: customizationTip,
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
        description:
          'You can use the Novu UI library to implement the notification center in your vanilla JavaScript application or any other non-supported framework like Vue.',
        code: `import { NovuUI } from '@novu/js/ui';

 const novu = new NovuUI({
  options: {
    applicationIdentifier: '123',
    subscriberId: '456',
  },
});

novu.mountComponent({
  name: 'Inbox',
  props: {},
  element: document.getElementById('notification-inbox'),
});`,
        codeLanguage: 'typescript',
        tip: customizationTip,
      },
    ],
  },
];
