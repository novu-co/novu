import { Separator } from '@/components/primitives/separator';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { EmailPreviewHeader } from '@/components/workflow-editor/steps/email/email-preview';
import { PushTabsSection } from '@/components/workflow-editor/steps/push/push-tabs-section';
import { type UiSchema } from '@novu/shared';

const subjectKey = 'subject';
const emailEditorKey = 'emailEditor';

type PushEditorProps = { uiSchema: UiSchema };
export const PushEditor = (props: PushEditorProps) => {
  const { uiSchema } = props;
  const { [emailEditorKey]: emailEditor, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <PushTabsSection>
        <EmailPreviewHeader />
      </PushTabsSection>
      <PushTabsSection className="-mx-[2px] -my-[3px] px-7 py-2">
        {getComponentByType({ component: subject.component })}
      </PushTabsSection>
      <Separator className="bg-neutral-100" />
      {/* extra padding on the left to account for the drag handle */}
      <PushTabsSection className="basis-full pl-14">
        {emailEditor && getComponentByType({ component: emailEditor.component })}
      </PushTabsSection>
    </div>
  );
};
