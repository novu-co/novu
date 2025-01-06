import { Editor } from '@maily-to/core';
import {
  ChannelTypeEnum,
  ChatRenderOutput,
  GeneratePreviewResponseDto,
  InAppRenderOutput,
  PushRenderOutput,
  StepTypeEnum,
} from '@novu/shared';
import { ChatPreview } from './workflow-editor/steps/chat/chat-preview';
import { EmailPreviewHeader, EmailPreviewSubject } from './workflow-editor/steps/email/email-preview';
import { DEFAULT_EDITOR_BLOCKS, DEFAULT_EDITOR_CONFIG } from './workflow-editor/steps/email/maily-config';
import { InboxPreview } from './workflow-editor/steps/in-app/inbox-preview';
import { PushPreview } from './workflow-editor/steps/push/push-preview';
import { SmsPhone } from './workflow-editor/steps/sms/sms-phone';

export type StepType = StepTypeEnum;

interface StepPreviewProps {
  type: StepType;
  controlValues?: any;
}

export function StepPreview({ type, controlValues }: StepPreviewProps) {
  if (type === StepTypeEnum.TRIGGER || type === StepTypeEnum.DELAY || type === StepTypeEnum.DIGEST) {
    return null;
  }

  if (type === StepTypeEnum.IN_APP) {
    const { subject, body } = controlValues;

    return (
      <InboxPreview
        isPreviewPending={false}
        previewData={{
          result: {
            type: ChannelTypeEnum.IN_APP as const,
            preview: {
              subject,
              body,
            } as InAppRenderOutput,
          },
          previewPayloadExample: {},
        }}
      />
    );
  }

  if (type === StepTypeEnum.EMAIL) {
    const { subject, body } = controlValues;
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
        <div className="mx-auto w-full overflow-auto">
          <Editor config={DEFAULT_EDITOR_CONFIG} blocks={DEFAULT_EDITOR_BLOCKS} contentJson={parsedBody} />
        </div>
      </div>
    );
  }

  if (type === StepTypeEnum.SMS) {
    const { body } = controlValues;
    return (
      <div className="p-4">
        <SmsPhone smsBody={body} />
      </div>
    );
  }

  if (type === StepTypeEnum.CHAT) {
    const { body } = controlValues;
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
    const { subject, body } = controlValues;
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
}
