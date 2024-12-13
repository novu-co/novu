import { useFormContext } from 'react-hook-form';
import { InAppEditor } from '@/components/workflow-editor/steps/in-app/in-app-editor';
import { InAppEditorPreview } from '@/components/workflow-editor/steps/in-app/in-app-editor-preview';
import { CustomStepControls } from '../controls/custom-step-controls';
import { StepEditorProps } from '@/components/workflow-editor/steps/configure-step-template-form';
import { InAppTabsSection } from '@/components/workflow-editor/steps/in-app/in-app-tabs-section';
import { TemplateTabs } from '@/components/workflow-editor/steps/template-tabs';
import { WorkflowOriginEnum } from '@/utils/enums';
import { useState } from 'react';

export const InAppTabs = (props: StepEditorProps) => {
  const { workflow, step } = props;
  const { dataSchema, uiSchema } = step.controls;
  const form = useFormContext();
  const [tabsValue, setTabsValue] = useState('editor');

  const isNovuCloud = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && uiSchema;
  const isExternal = workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const editorContent = (
    <>
      {isNovuCloud && <InAppEditor uiSchema={uiSchema} />}
      {isExternal && (
        <InAppTabsSection>
          <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
        </InAppTabsSection>
      )}
    </>
  );

  const previewContent = <InAppEditorPreview workflow={workflow} step={step} formValues={form.getValues()} />;

  return (
    <TemplateTabs
      editorContent={editorContent}
      previewContent={previewContent}
      tabsValue={tabsValue}
      onTabChange={setTabsValue}
    />
  );
};
