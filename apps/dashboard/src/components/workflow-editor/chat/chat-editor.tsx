import { UiSchemaGroupEnum, type UiSchema } from '@novu/shared';

import { ChatTabsSection } from '@/components/workflow-editor/chat/chat-tabs-section';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';

const subjectKey = 'subject';
const bodyKey = 'body';

export const ChatEditor = ({ uiSchema }: { uiSchema?: UiSchema }) => {
  if (!uiSchema || uiSchema?.group !== UiSchemaGroupEnum.CHAT) {
    return null;
  }

  const { [subjectKey]: subject, [bodyKey]: body } = uiSchema.properties ?? {};

  return (
    <div className="flex flex-col">
      <ChatTabsSection className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 p-1">
          {subject && getComponentByType({ component: subject.component })}
          {body && getComponentByType({ component: body.component })}
        </div>
      </ChatTabsSection>
    </div>
  );
};
