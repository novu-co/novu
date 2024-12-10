import { Separator } from '@/components/primitives/separator';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { EmailPreviewHeader } from '@/components/workflow-editor/steps/email/email-preview';
import { EmailTabsEditSection } from '@/components/workflow-editor/steps/email/email-tabs-section';
import { type UiSchema } from '@novu/shared';

const subjectKey = 'subject';
const emailEditorKey = 'emailEditor';

type EmailEditorProps = { uiSchema?: UiSchema };
export const EmailEditor = (props: EmailEditorProps) => {
  const { uiSchema } = props;
  const { [emailEditorKey]: emailEditor, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <>
      <EmailPreviewHeader className="p-3" />
      <EmailTabsEditSection>{subject && getComponentByType({ component: subject.component })}</EmailTabsEditSection>

      <Separator className="bg-neutral-100" />
      <EmailTabsEditSection>
        {emailEditor && getComponentByType({ component: emailEditor.component })}
      </EmailTabsEditSection>
    </>
  );
};
