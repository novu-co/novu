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
import {
  ChannelTypeEnum,
  ChatRenderOutput,
  GeneratePreviewResponseDto,
  PushRenderOutput,
  StepTypeEnum,
} from '@novu/shared';
import {
  InAppPreview,
  InAppPreviewActions,
  InAppPreviewBell,
  InAppPreviewBody,
  InAppPreviewHeader,
  InAppPreviewNotification,
  InAppPreviewNotificationContent,
  InAppPreviewPrimaryAction,
  InAppPreviewSubject,
} from './workflow-editor/in-app-preview';
import { ChatPreview } from './workflow-editor/steps/chat/chat-preview';
import { EmailPreviewHeader, EmailPreviewSubject } from './workflow-editor/steps/email/email-preview';
import { PushPreview } from './workflow-editor/steps/push/push-preview';
import { SmsPhone } from './workflow-editor/steps/sms/sms-phone';

export type StepType = StepTypeEnum;

interface StepPreviewProps {
  type: StepType;
  controlValues?: any;
}

export function StepPreview({ type, controlValues }: StepPreviewProps) {
  if (type === StepTypeEnum.TRIGGER) {
    return null;
  }

  if (type === StepTypeEnum.IN_APP) {
    const { subject, body, action } = controlValues;

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

  return (
    <div className="p-4">
      <div className="text-foreground-600 text-sm">Preview coming soon</div>
    </div>
  );
}
