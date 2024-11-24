import { ArrowLeft, Bell, Mail, MessageCircle, MessageSquare, Smartphone } from 'lucide-react';
import { Card, CardContent } from '../primitives/card';
import { STEP_TYPE_TO_ICON } from '../icons/utils';
import { ChannelTypeEnum, StepTypeEnum } from '@novu/shared';
import { STEP_TYPE_TO_COLOR } from '../../utils/color';

const channelOptions = [
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.EMAIL],
    title: 'E-Mail',
    color: STEP_TYPE_TO_COLOR[StepTypeEnum.EMAIL],
    id: ChannelTypeEnum.EMAIL,
    description: 'Sends Emails to your users via Novu',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.IN_APP],
    title: 'Inbox',
    color: STEP_TYPE_TO_COLOR[StepTypeEnum.IN_APP],
    id: ChannelTypeEnum.IN_APP,
    description: 'Integrate & Embed <Inbox/> in your product',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.SMS],
    title: 'SMS',
    color: STEP_TYPE_TO_COLOR[StepTypeEnum.SMS],
    id: ChannelTypeEnum.SMS,
    description: 'Sends SMS messages to your users',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.PUSH],
    title: 'Push',
    color: STEP_TYPE_TO_COLOR[StepTypeEnum.PUSH],
    id: ChannelTypeEnum.PUSH,
    description: 'Send push notifications to your users',
  },
  {
    icon: STEP_TYPE_TO_ICON[StepTypeEnum.CHAT],
    title: 'Chat',
    color: STEP_TYPE_TO_COLOR[StepTypeEnum.CHAT],
    id: ChannelTypeEnum.CHAT,
    description: 'Send chat notifications via Novu to your users',
  },
];

interface UsecaseSelectOnboardingProps {
  onHover: (id: ChannelTypeEnum | null) => void;
  onClick: (id: ChannelTypeEnum) => void;
  selectedUseCases: ChannelTypeEnum[];
}

export function UsecaseSelectOnboarding({ onHover, onClick, selectedUseCases }: UsecaseSelectOnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-[60px] pb-0">
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
              className={`rounded-xl border ${selectedUseCases.includes(option.id) ? 'border-transparent' : 'border-neutral-200'} shadow-none transition-all duration-300`}
              onMouseEnter={() => onHover(option.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(option.id)}
            >
              <CardContent
                className={`rounded-xl p-[2.5px] hover:cursor-pointer ${
                  selectedUseCases.includes(option.id)
                    ? 'bg-gradient-to-r from-[hsla(20,100%,65%,1)] to-[hsla(310,100%,45%,1)]'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3.5 rounded-xl bg-[#ffffff] p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center opacity-40`}
                    style={{ color: `hsl(var(--${option.color}))` }}
                  >
                    <option.icon className={`h-8 w-8 fill-${option.color} stroke-${option.color}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-[#232529]">{option.title}</h3>
                    <p className="text-xs text-[#717784]">{option.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
