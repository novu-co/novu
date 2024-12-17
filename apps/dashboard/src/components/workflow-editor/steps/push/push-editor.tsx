import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { PushTabsSection } from '@/components/workflow-editor/steps/push/push-tabs-section';
import { type UiSchema } from '@novu/shared';
import { RiCellphoneFill } from 'react-icons/ri';

const subjectKey = 'subject';
const bodyKey = 'body';

type PushEditorProps = { uiSchema: UiSchema };
export const PushEditor = (props: PushEditorProps) => {
  const { uiSchema } = props;
  const { [bodyKey]: body, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <PushTabsSection className="py-5">
        <div className="flex items-center gap-2.5 pb-2 text-sm font-medium">
          <RiCellphoneFill className="size-3" />
          <span>Push template editor</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-1">
          {getComponentByType({ component: subject.component })}
          {getComponentByType({ component: body.component })}
        </div>
      </PushTabsSection>
    </div>
  );
};
