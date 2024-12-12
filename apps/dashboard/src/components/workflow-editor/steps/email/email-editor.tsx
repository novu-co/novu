import { Separator } from '@/components/primitives/separator';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { EmailPreviewHeader } from '@/components/workflow-editor/steps/email/email-preview';
import { type UiSchema } from '@novu/shared';

const subjectKey = 'subject';
const emailEditorKey = 'emailEditor';

type EmailEditorProps = { uiSchema?: UiSchema };
export const EmailEditor = (props: EmailEditorProps) => {
  const { uiSchema } = props;
  const { [emailEditorKey]: emailEditor, [subjectKey]: subject } = uiSchema?.properties ?? {};

  return (
    <>
      <EmailPreviewHeader />
      <div className="px-8 py-2">{getComponentByType({ component: subject.component })}</div>
      <Separator className="bg-neutral-100" />
      <div className="pl-6">{emailEditor && getComponentByType({ component: emailEditor.component })}</div>
    </>
  );
};
