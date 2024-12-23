import { type StepDataDto, type WorkflowResponseDto } from '@novu/shared';
import { RiCellphoneFill } from 'react-icons/ri';
import { useEditorPreview } from '@/components/workflow-editor/steps/use-editor-preview';
import { PushPreview } from '@/components/workflow-editor/steps/push/push-preview';
import { TabsSection } from '@/components/workflow-editor/steps/tabs-section';
import { InlineToast } from '@/components/primitives/inline-toast';
import { ConfigurePreviewAccordion } from '../shared/configure-preview-accordion';

type PushEditorPreviewProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  formValues: Record<string, unknown>;
};

export const PushEditorPreview = ({ workflow, step, formValues }: PushEditorPreviewProps) => {
  const workflowSlug = workflow.workflowId;
  const stepSlug = step.stepId;
  const { editorValue, setEditorValue, previewStep, previewData, isPreviewPending } = useEditorPreview({
    workflowSlug,
    stepSlug,
    controlValues: formValues,
  });

  return (
    <TabsSection>
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2.5 pb-2 text-sm font-medium">
          <RiCellphoneFill className="size-3" />
          <span>Push template editor</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <PushPreview isPreviewPending={isPreviewPending} previewData={previewData} />
          <InlineToast
            description="This preview shows how your message will appear on mobile. Actual rendering may vary by device."
            className="w-full px-3"
          />
        </div>
        <ConfigurePreviewAccordion
          editorValue={editorValue}
          setEditorValue={setEditorValue}
          previewStep={previewStep}
        />
      </div>
    </TabsSection>
  );
};
