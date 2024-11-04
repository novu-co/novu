import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePreviewStep } from '@/hooks';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';

export function EditStepInAppPreview() {
  const { previewStep, data } = usePreviewStep();
  const { workflowSlug, stepId } = useParams<{
    workflowSlug: string;
    stepId: string;
  }>();

  useEffect(() => {
    if (workflowSlug && stepId) {
      previewStep({ workflowSlug, stepId });
    }
  }, [workflowSlug, stepId, previewStep]);

  if (!data) {
    return null;
  }

  return <InAppPreview data={data} />;
}
