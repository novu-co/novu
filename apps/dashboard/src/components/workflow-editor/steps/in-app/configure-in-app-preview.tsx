import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePreviewStep } from '@/hooks';
import { InAppPreview } from '@/components/workflow-editor/in-app-preview';

export function ConfigureInAppPreview() {
  const { previewStep, data } = usePreviewStep();
  const { workflowSlug, stepSlug } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();

  useEffect(() => {
    if (workflowSlug && stepSlug) {
      previewStep({ workflowSlug, stepSlug });
    }
  }, [workflowSlug, stepSlug, previewStep]);

  if (!data) {
    return null;
  }

  return <InAppPreview data={data} />;
}
