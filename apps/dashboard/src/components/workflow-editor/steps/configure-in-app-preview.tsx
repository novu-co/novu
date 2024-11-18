import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePreviewStep } from '@/hooks';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';
import { useStepEditorContext } from '@/components/workflow-editor/steps/hooks';

export function ConfigureInAppPreview() {
  const { previewStep, data, isPending: isPreviewPending } = usePreviewStep();
  const { step, isPendingStep } = useStepEditorContext();

  const { workflowSlug, stepSlug } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();

  useEffect(() => {
    if (!workflowSlug || !stepSlug || !step || isPendingStep) return;

    previewStep({
      workflowSlug,
      stepSlug,
      data: { controlValues: step.controls.values, previewPayload: {} },
    });
  }, [workflowSlug, stepSlug, previewStep, step, isPendingStep]);

  return <InAppPreview data={data} truncateBody isLoading={isPreviewPending} />;
}
