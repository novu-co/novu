import { useState } from 'react';
import { WorkflowOriginEnum } from '@novu/shared';
import { StepEditorProps } from '@/components/workflow-editor/steps/configure-step-template-form';
import { PushEditor } from '@/components/workflow-editor/steps/push/push-editor';
import { CustomStepControls } from '../controls/custom-step-controls';
import { TemplateTabs } from '../template-tabs';

export const PushTabs = (props: StepEditorProps) => {
  const { workflow, step } = props;
  const { dataSchema, uiSchema } = step.controls;
  const [tabsValue, setTabsValue] = useState('editor');

  const isNovuCloud = workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && uiSchema;
  const isExternal = workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const editorContent = (
    <>
      {isNovuCloud && <PushEditor uiSchema={uiSchema} />}
      {isExternal && <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />}
    </>
  );

  const previewContent = <>TODO</>;

  return (
    <TemplateTabs
      editorContent={editorContent}
      previewContent={previewContent}
      tabsValue={tabsValue}
      onTabChange={setTabsValue}
    />
  );
};
