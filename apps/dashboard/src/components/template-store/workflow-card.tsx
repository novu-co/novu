import React from 'react';
import { Card, CardContent } from '../primitives/card';
import { Bell, MessageSquare, MessageCircle, BellRing } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type StepType = 'In-App' | 'Email' | 'SMS' | 'Push';

interface Step {
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
}

interface WorkflowCardProps {
  name: string;
  description: string;
  steps?: StepType[];
  onClick?: () => void;
}

const STEP_ICON_MAP: Record<StepType, LucideIcon> = {
  'In-App': Bell,
  Email: MessageSquare,
  SMS: MessageCircle,
  Push: BellRing,
};

const STEP_COLORS: Record<StepType, { bg: string; border: string }> = {
  'In-App': {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
  Email: {
    bg: 'bg-[#E7F6F3]',
    border: 'border-[#4EC2AB]',
  },
  SMS: {
    bg: 'bg-[#FFE9F3]',
    border: 'border-[#FF4E9E]',
  },
  Push: {
    bg: 'bg-[#E7EEFF]',
    border: 'border-[#4E77FF]',
  },
};

export function WorkflowCard({
  name,
  description,
  steps = ['In-App', 'Email', 'SMS', 'Push'],
  onClick,
}: WorkflowCardProps) {
  const mappedSteps = steps.map((step) => ({
    icon: STEP_ICON_MAP[step],
    bgColor: STEP_COLORS[step].bg,
    borderColor: STEP_COLORS[step].border,
  }));

  return (
    <Card
      className="border-stroke-soft min-h-[138px] min-w-[250px] border shadow-none hover:cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="overflow-hidden rounded-lg border border-neutral-100">
          <div className="bg-bg-weak relative h-[114px] bg-[url(/images/dots.svg)] bg-cover">
            <div className="flex h-full w-full items-center justify-center">
              {mappedSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${step.bgColor} ${step.borderColor}`}
                  >
                    <step.icon className="h-[9px] w-[9px] text-gray-600" />
                  </div>
                  {index < mappedSteps.length - 1 && <div className="h-px w-6 bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-label-sm text-text-strong mb-1">{name}</h3>
          <p className="text-paragraph-xs text-text-sub truncate">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
