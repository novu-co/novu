import { useFormContext } from 'react-hook-form';
import { WorkflowOriginEnum } from '@novu/shared';
import { EmailEditor } from '@/components/workflow-editor/steps/email/email-editor';
import { EmailEditorPreview } from '@/components/workflow-editor/steps/email/email-editor-preview';
import { CustomStepControls } from '../controls/custom-step-controls';
import { EmailTabsSection } from '@/components/workflow-editor/steps/email/email-tabs-section';
import { StepEditorProps } from '@/components/workflow-editor/steps/configure-step-template-form';
import { TemplateTabs } from '@/components/workflow-editor/steps/template-tabs';
import { useState } from 'react';

export const EmailTabs = (props: StepEditorProps) => {
  const { workflow, step } = props;
  const { dataSchema, uiSchema } = step.controls;
  const form = useFormContext();
  const [tabsValue, setTabsValue] = useState('editor');

  const isNovuCloud = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && uiSchema;
  const isExternal = workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const editorContent = (
    <>
      {isNovuCloud && <EmailEditor uiSchema={uiSchema} />}
      {isExternal && (
        <EmailTabsSection>
          <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
        </EmailTabsSection>
      )}
    </>
  );

  const previewContent = <EmailEditorPreview workflow={workflow} step={step} formValues={form.getValues()} />;

  return (
    <TemplateTabs
      editorContent={editorContent}
      previewContent={previewContent}
      tabsValue={tabsValue}
      onTabChange={setTabsValue}
    />
  );
};
