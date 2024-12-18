import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { SmsTabsSection } from '@/components/workflow-editor/steps/sms/sms-tabs-section';
import { type UiSchema } from '@novu/shared';

type SmsEditorProps = { uiSchema: UiSchema };
export const SmsEditor = (props: SmsEditorProps) => {
  const { uiSchema } = props;
  const { body } = uiSchema.properties ?? {};

  return (
    <div className="flex h-full flex-col">
      <SmsTabsSection className="py-5">
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-100 p-1">
          {getComponentByType({ component: body.component })}
        </div>
      </SmsTabsSection>
    </div>
  );
};
