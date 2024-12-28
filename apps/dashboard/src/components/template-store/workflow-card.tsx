import React from 'react';
import { Card, CardContent } from '../primitives/card';
import { Bell, MessageSquare, MessageCircle, BellRing } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { StepTypeEnum } from '@novu/shared';

export type StepType = StepTypeEnum;

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
  [StepTypeEnum.IN_APP]: Bell,
  [StepTypeEnum.EMAIL]: MessageSquare,
  [StepTypeEnum.SMS]: MessageCircle,
  [StepTypeEnum.PUSH]: BellRing,
  [StepTypeEnum.CHAT]: MessageSquare,
  [StepTypeEnum.DIGEST]: Bell,
  [StepTypeEnum.TRIGGER]: Bell,
  [StepTypeEnum.DELAY]: Bell,
  [StepTypeEnum.CUSTOM]: Bell,
};

const STEP_COLORS: Record<StepType, { bg: string; border: string }> = {
  [StepTypeEnum.IN_APP]: {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
  [StepTypeEnum.EMAIL]: {
    bg: 'bg-[#E7F6F3]',
    border: 'border-[#4EC2AB]',
  },
  [StepTypeEnum.SMS]: {
    bg: 'bg-[#FFE9F3]',
    border: 'border-[#FF4E9E]',
  },
  [StepTypeEnum.PUSH]: {
    bg: 'bg-[#E7EEFF]',
    border: 'border-[#4E77FF]',
  },
  [StepTypeEnum.CHAT]: {
    bg: 'bg-[#E7F6F3]',
    border: 'border-[#4EC2AB]',
  },
  [StepTypeEnum.DIGEST]: {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
  [StepTypeEnum.TRIGGER]: {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
  [StepTypeEnum.DELAY]: {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
  [StepTypeEnum.CUSTOM]: {
    bg: 'bg-[#FFE5D3]',
    border: 'border-[#FF8D4E]',
  },
};

export function WorkflowCard({
  name,
  description,
  steps = [StepTypeEnum.IN_APP, StepTypeEnum.EMAIL, StepTypeEnum.SMS, StepTypeEnum.PUSH],
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
