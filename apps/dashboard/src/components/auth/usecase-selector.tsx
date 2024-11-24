import { ArrowLeft, Bell, Mail, MessageCircle, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import { Button } from '../primitives/button';
import { STEP_TYPE_TO_ICON } from '../icons/utils';
import { StepTypeEnum } from '@novu/shared';

const channelOptions = [
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.EMAIL],
    title: 'E-Mail',
    color: 'blue-200',
    id: 'email',
    description: 'Sends Emails to your users via Novu',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.IN_APP],
    title: 'Inbox',
    color: 'emerald-200',
    id: 'inbox',
    description: 'Integrate & Embed <Inbox/> in your product',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.SMS],
    title: 'SMS',
    color: 'pink-200',
    id: 'sms',
    description: 'Sends SMS messages to your users',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.PUSH],
    title: 'Push',
    color: 'sky-200',
    id: 'push',
    description: 'Send push notifications to your users',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.CHAT],
    title: 'Chat',
    color: 'purple-200',
    id: 'chat',
    description: 'Send chat notifications via Novu to your users',
  },
];

interface UsecaseSelectOnboardingProps {
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  selectedUseCases: string[];
}

export function UsecaseSelectOnboarding({ onHover, onClick, selectedUseCases }: UsecaseSelectOnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-[60px]">
      <div className="flex w-[360px] flex-col items-center gap-8">
        <div className="flex w-full flex-col items-start gap-1">
          <div className="flex w-full items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs text-[#717784]">3/3</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-[#232529]">How do you plan to use Novu?</h2>
            <p className="text-xs text-[#717784]">
              You can route notifications across channels intelligently with Novu's powerful workflows, among the
              channels below.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          {channelOptions.map((option, index) => (
            <Card
              key={index}
              className={`border border-neutral-200 shadow-none transition-all duration-300`}
              onMouseEnter={() => onHover(option.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(option.id)}
            >
              <CardContent
                className={`flex items-start gap-3.5 rounded-xl border-[2px] border-transparent p-4 hover:cursor-pointer ${selectedUseCases.includes(option.id) ? 'border-[#FF884D]' : 'border-transparent'}`}
              >
                <div className="flex h-10 w-10 items-center justify-center">
                  <option.icon className={`h-8 w-8 text-${option.color}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-[#232529]">{option.title}</h3>
                  <p className="text-xs text-[#717784]">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
