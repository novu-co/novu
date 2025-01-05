import { CreateWorkflowDto, StepTypeEnum } from '@novu/shared';
import React from 'react';
import { Card, CardContent } from '../primitives/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../primitives/hover-card';
import { StepPreview, StepType } from '../step-preview-hover-card';
import { WorkflowStep } from '../workflow-step';

type WorkflowCardProps = {
  name: string;
  description: string;
  steps?: StepType[];
  onClick?: () => void;
  template?: CreateWorkflowDto;
};

export function WorkflowCard({
  name,
  description,
  steps = [StepTypeEnum.IN_APP, StepTypeEnum.EMAIL, StepTypeEnum.SMS, StepTypeEnum.PUSH],
  onClick,
  template,
}: WorkflowCardProps) {
  return (
    <Card
      className="border-stroke-soft min-h-[138px] min-w-[250px] border shadow-none hover:cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="overflow-hidden rounded-lg border border-neutral-100">
          <div className="bg-bg-weak relative h-[114px] bg-[url(/images/dots.svg)] bg-cover">
            <div className="flex h-full w-full items-center justify-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <HoverCard openDelay={100}>
                    <HoverCardTrigger>
                      <WorkflowStep step={step} />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[350px] p-0" sideOffset={5}>
                      <StepPreview
                        type={steps[index]}
                        stepContent={template?.steps?.find((s) => s.type === steps[index])}
                      />
                    </HoverCardContent>
                  </HoverCard>
                  {index < steps.length - 1 && <div className="h-px w-6 bg-gray-200" />}
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
