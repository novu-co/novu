import React from 'react';
import { Card, CardContent } from '../primitives/card';
import { Bell, MessageSquare, MessageCircle, BellRing } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import {
  StepTypeEnum,
  ChannelTypeEnum,
  ChatRenderOutput,
  PushRenderOutput,
  GeneratePreviewResponseDto,
} from '@novu/shared';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../primitives/hover-card';
import {
  InAppPreview,
  InAppPreviewBell,
  InAppPreviewHeader,
  InAppPreviewNotification,
  InAppPreviewNotificationContent,
  InAppPreviewSubject,
  InAppPreviewBody,
  InAppPreviewActions,
  InAppPreviewPrimaryAction,
} from '../workflow-editor/in-app-preview';
import { EmailPreviewHeader, EmailPreviewSubject } from '../workflow-editor/steps/email/email-preview';
import { Editor } from '@maily-to/core';
import {
  blockquote,
  bulletList,
  button,
  columns,
  divider,
  hardBreak,
  heading1,
  heading2,
  heading3,
  image,
  orderedList,
  section,
  spacer,
  text,
} from '@maily-to/core/blocks';
import { CreateWorkflowDto } from '@novu/shared';
import { WorkflowStep } from '../workflow-step';
import { SmsPhone } from '../workflow-editor/steps/sms/sms-phone';
import { ChatPreview } from '../workflow-editor/steps/chat/chat-preview';
import { PushPreview } from '../workflow-editor/steps/push/push-preview';

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
  template?: CreateWorkflowDto;
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

function StepPreview({ type, stepContent }: { type: StepType; stepContent?: any }) {
  if (!stepContent) {
    return (
      <div className="p-4">
        <div className="text-foreground-600 text-sm">Preview coming soon</div>
      </div>
    );
  }

  if (type === StepTypeEnum.IN_APP) {
    const { subject, body, action } = stepContent.controlValues;

    return (
      <InAppPreview>
        <InAppPreviewBell />
        <InAppPreviewHeader />
        <InAppPreviewNotification>
          <InAppPreviewNotificationContent>
            <InAppPreviewSubject>{subject}</InAppPreviewSubject>
            <InAppPreviewBody>{body}</InAppPreviewBody>
            {action?.buttons?.length > 0 && (
              <InAppPreviewActions>
                {action.buttons.map((button: any, index: number) => (
                  <InAppPreviewPrimaryAction key={index}>{button.content}</InAppPreviewPrimaryAction>
                ))}
              </InAppPreviewActions>
            )}
          </InAppPreviewNotificationContent>
        </InAppPreviewNotification>
      </InAppPreview>
    );
  }

  if (type === StepTypeEnum.EMAIL) {
    const { subject, body } = stepContent.controlValues;
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      console.error('Failed to parse email body:', e);
      return (
        <div className="p-4">
          <div className="text-foreground-600 text-sm">Error parsing email content</div>
        </div>
      );
    }

    return (
      <div className="bg-background pointer-events-none p-3">
        <EmailPreviewHeader />
        <EmailPreviewSubject className="px-3 py-2" subject={subject} />
        <div className="mx-auto min-h-96 w-full overflow-auto">
          <Editor
            config={{
              hasMenuBar: false,
              autofocus: false,
              wrapClassName: 'min-h-0 max-h-full flex flex-col w-full h-full overflow-y-auto',
              bodyClassName:
                '!bg-transparent flex flex-col basis-full !border-none !mt-0 [&>div]:basis-full [&_.tiptap]:h-full',
            }}
            blocks={[
              text,
              heading1,
              heading2,
              heading3,
              bulletList,
              orderedList,
              image,
              section,
              columns,
              divider,
              spacer,
              button,
              hardBreak,
              blockquote,
            ]}
            contentJson={parsedBody}
          />
        </div>
      </div>
    );
  }

  if (type === StepTypeEnum.SMS) {
    const { body } = stepContent.controlValues;
    return (
      <div className="p-4">
        <SmsPhone smsBody={body} />
      </div>
    );
  }

  if (type === StepTypeEnum.CHAT) {
    const { body } = stepContent.controlValues;
    const mockPreviewData: GeneratePreviewResponseDto = {
      result: {
        type: ChannelTypeEnum.CHAT as const,
        preview: {
          body,
          content: body,
        } as ChatRenderOutput,
      },
      previewPayloadExample: {},
    };

    return (
      <div className="p-4">
        <ChatPreview isPreviewPending={false} previewData={mockPreviewData} />
      </div>
    );
  }

  if (type === StepTypeEnum.PUSH) {
    const { subject, body } = stepContent.controlValues;
    const mockPreviewData: GeneratePreviewResponseDto = {
      result: {
        type: ChannelTypeEnum.PUSH as const,
        preview: {
          subject,
          body,
          title: subject,
          content: body,
        } as PushRenderOutput,
      },
      previewPayloadExample: {},
    };

    return (
      <div className="p-4">
        <PushPreview isPreviewPending={false} previewData={mockPreviewData} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-foreground-600 text-sm">Preview coming soon</div>
    </div>
  );
}

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
