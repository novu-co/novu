import { type StepDataDto, type WorkflowResponseDto } from '@novu/shared';
import { Notification5Fill } from '@/components/icons';
import { InAppTabsSection } from '@/components/workflow-editor/steps/in-app/in-app-tabs-section';
import { useEditorPreview } from '../use-editor-preview';
import { InboxPreview } from './inbox-preview';
import { ConfigurePreviewAccordion } from '../shared/configure-preview-accordion';

type InAppEditorPreviewProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  formValues: Record<string, unknown>;
};

export const InAppEditorPreview = ({ workflow, step, formValues }: InAppEditorPreviewProps) => {
  const workflowSlug = workflow.workflowId;
  const stepSlug = step.stepId;
  const { editorValue, setEditorValue, previewStep, previewData, isPreviewPending } = useEditorPreview({
    workflowSlug,
    stepSlug,
    controlValues: formValues,
  });

  return (
    <InAppTabsSection>
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Notification5Fill className="size-3" />
          In-App template editor
        </div>
        <InboxPreview isPreviewPending={isPreviewPending} previewData={previewData} />
        <ConfigurePreviewAccordion
          editorValue={editorValue}
          setEditorValue={setEditorValue}
          previewStep={previewStep}
        />
      </div>
    </InAppTabsSection>
  );
};
