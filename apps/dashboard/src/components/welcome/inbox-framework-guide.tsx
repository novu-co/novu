import { Loader } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import { useState, useEffect } from 'react';
import { Framework, frameworks, FrameworkInstructions } from './framework-guides';
import { IEnvironment } from '@novu/shared';
import { API_HOSTNAME, WEBSOCKET_HOSTNAME } from '../../config';

interface InboxFrameworkGuideProps {
  currentEnvironment: IEnvironment | undefined;
  subscriberId: string;
  primaryColor: string;
  foregroundColor: string;
}

export function InboxFrameworkGuide({
  currentEnvironment,
  subscriberId,
  primaryColor,
  foregroundColor,
}: InboxFrameworkGuideProps) {
  const [selectedFramework, setSelectedFramework] = useState(frameworks.find((f) => f.selected) || frameworks[0]);

  useEffect(() => {
    if (!currentEnvironment?.identifier || !subscriberId) return;

    const isDefaultApi = API_HOSTNAME === 'https://api.novu.co';
    const isDefaultWs = WEBSOCKET_HOSTNAME === 'https://ws.novu.co';

    // Create the common URL props based on environment
    const urlProps = [
      ...(isDefaultApi ? [] : [`backendUrl="${API_HOSTNAME}"`]),
      ...(isDefaultWs ? [] : [`socketUrl="${WEBSOCKET_HOSTNAME}"`]),
    ].join('\n      ');

    // Create the full Inbox component string (with appearance)
    const inboxComponentString = `<Inbox
      applicationIdentifier="${currentEnvironment.identifier}"
      subscriberId="${subscriberId}"
      routerPush={(path: string) => router.push(path)}${urlProps ? '\n      ' + urlProps : ''}
      appearance={{
        variables: {
          colorPrimary: "${primaryColor}",
          colorForeground: "${foregroundColor}"
        }
      }}
    />`;

    // Create the full NovuProvider component string (without appearance)
    const novuProviderString = `<NovuProvider
      applicationIdentifier="${currentEnvironment.identifier}"
      subscriberId="${subscriberId}"${urlProps ? '\n      ' + urlProps : ''}
    >
      <YourCustomInbox />
    </NovuProvider>`;

    const updatedFrameworks = frameworks.map((framework) => ({
      ...framework,
      installSteps: framework.installSteps.map((step) => ({
        ...step,
        code: step.code
          ?.replace(/<Inbox[\s\S]*?\/>/, inboxComponentString)
          ?.replace(/<NovuProvider[\s\S]*?<\/NovuProvider>/, novuProviderString)
          ?.replace(/YOUR_APP_ID/g, currentEnvironment.identifier)
          ?.replace(/YOUR_APPLICATION_IDENTIFIER/g, currentEnvironment.identifier)
          ?.replace(/YOUR_SUBSCRIBER_ID/g, subscriberId),
      })),
    }));

    setSelectedFramework(updatedFrameworks.find((f) => f.name === selectedFramework.name) || updatedFrameworks[0]);
  }, [currentEnvironment?.identifier, subscriberId, selectedFramework.name, primaryColor, foregroundColor]);

  function handleFrameworkSelect(framework: Framework) {
    setSelectedFramework(framework);
  }

  return (
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
          <p className="text-foreground-400 text-xs">You're just a couple steps away from your first notification.</p>
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

      <div className="min-h-[600px] w-full">
        <FrameworkInstructions framework={selectedFramework} />
      </div>
    </>
  );
}
