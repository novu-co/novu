import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { PushTabsSection } from '@/components/workflow-editor/steps/push/push-tabs-section';
import { type UiSchema } from '@novu/shared';

const subjectKey = 'subject';
const bodyKey = 'body';

type PushEditorProps = { uiSchema: UiSchema };
export const PushEditor = (props: PushEditorProps) => {
  const { uiSchema } = props;
  const { [bodyKey]: body, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <PushTabsSection className="py-5">
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-1">
          {getComponentByType({ component: subject.component })}
          {getComponentByType({ component: body.component })}
        </div>
      </PushTabsSection>
    </div>
  );
};
