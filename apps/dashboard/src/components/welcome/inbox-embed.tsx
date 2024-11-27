import { Loader } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import {
  RiAngularjsFill,
  RiJavascriptFill,
  RiNextjsFill,
  RiReactjsFill,
  RiRemixRunFill,
  RiSvelteFill,
  RiVuejsFill,
} from 'react-icons/ri';

// Framework data with brand colors
const frameworks = [
  {
    name: 'Next.js',
    icon: <RiNextjsFill className="text-black" />,
    selected: true,
  },
  {
    name: 'React',
    icon: <RiReactjsFill className="text-[#61DAFB]" />,
  },
  {
    name: 'Remix',
    icon: <RiRemixRunFill className="text-black" />,
  },
  {
    name: 'SvelteJS',
    icon: <RiSvelteFill className="text-[#FF3E00]" />,
  },
  {
    name: 'Angular',
    icon: <RiAngularjsFill className="text-[#DD0031]" />,
  },
  {
    name: 'VueJS',
    icon: <RiVuejsFill className="text-[#4FC08D]" />,
  },
  {
    name: 'JavaScript',
    icon: <RiJavascriptFill className="text-[#F7DF1E]" />,
  },
];

export function InboxEmbed(): JSX.Element {
  return (
    <main className="flex flex-col pl-[100px]">
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
            className={`flex h-[100px] w-[100px] flex-col items-center justify-center border-none p-6 shadow-none transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:cursor-pointer hover:shadow-md ${framework.selected ? 'bg-neutral-100' : ''}`}
          >
            <CardContent className="flex flex-col items-center gap-3 p-0">
              <span className="text-2xl">{framework.icon}</span>
              <span className="text-sm text-[#525866]">{framework.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Installation Steps */}
      <div className="flex flex-col gap-8 pl-[72px]">
        <div className="relative border-l border-[#eeeef0] p-8 pt-[24px]">
          {/* Step 1 */}
          <div className="relative flex gap-8">
            {/* Step number overlay */}
            <div className="absolute -left-[44px] -mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950">
              <span className="text-sm font-medium text-white">1</span>
            </div>

            {/* Existing step 1 content */}
            <div className="flex max-w-md flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Install</span>
                <code className="rounded-md border border-[#eeeef0] bg-[#f7f7f8] px-2 py-1 text-sm">@novu/react</code>
              </div>
              <p className="text-sm text-[#525866]">The npm package to use with novu and react.</p>
            </div>

            <Card className="w-[500px] bg-[#18181b] text-white">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[#525866]">Terminal</span>
                </div>
                <pre className="text-sm">npm install @novu/react</pre>
              </CardContent>
            </Card>
          </div>

          {/* Step 2 */}
          <div className="relative mt-8 flex gap-8">
            {/* Step number overlay */}
            <div className="absolute -left-[44px] -mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950">
              <span className="text-sm font-medium text-white">2</span>
            </div>

            {/* Existing step 2 content */}
            <div className="flex max-w-md flex-col gap-3">
              <h3 className="text-sm font-medium">Add the inbox code to your react file</h3>
              <p className="text-sm text-[#525866]">
                Novu uses the routerPush prop to make your notifications navigatable. We will automatically pass the
                redirect.url from your workflow definitions to the routerPush prop.
              </p>
            </div>

            <Card className="w-[500px] bg-[#18181b] text-white">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[#525866]">Javascript</span>
                </div>
                <pre className="whitespace-pre-line text-sm">
                  {`import { Inbox } from '@novu/react';
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
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
