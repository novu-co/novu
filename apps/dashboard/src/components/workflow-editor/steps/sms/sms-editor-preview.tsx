import { type StepDataDto, type WorkflowResponseDto } from '@novu/shared';
import { Sms } from '@/components/icons';
import { SmsPreview } from '@/components/workflow-editor/steps/sms/sms-preview';
import { useEditorPreview } from '../use-editor-preview';
import { InlineToast } from '@/components/primitives/inline-toast';
import { TabsSection } from '@/components/workflow-editor/steps/tabs-section';
import { ConfigurePreviewAccordion } from '../shared/configure-preview-accordion';

type SmsEditorPreviewProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  formValues: Record<string, unknown>;
};

export const SmsEditorPreview = ({ workflow, step, formValues }: SmsEditorPreviewProps) => {
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
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Sms className="size-3" />
          SMS template editor
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <SmsPreview isPreviewPending={isPreviewPending} previewData={previewData} />
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
