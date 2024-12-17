import { usePreviewStep } from '@/hooks/use-preview-step';
import { PushBasePreview } from './push-base-preview';
import * as Sentry from '@sentry/react';
import { useWorkflow } from '../../workflow-provider';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

export function ConfigurePushStepPreview() {
  const {
    previewStep,
    data: previewData,
    isPending: isPreviewPending,
  } = usePreviewStep({
    onError: (error) => {
      Sentry.captureException(error);
    },
  });

  const { step, isPending } = useWorkflow();

  const { workflowSlug, stepSlug } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();

  useEffect(() => {
    if (!workflowSlug || !stepSlug || !step || isPending) return;

    previewStep({
      workflowSlug,
      stepSlug,
      previewData: { controlValues: step.controls.values, previewPayload: {} },
    });
  }, [workflowSlug, stepSlug, previewStep, step, isPending]);

  return <PushBasePreview previewData={previewData} isPreviewPending={isPreviewPending} />;
}
