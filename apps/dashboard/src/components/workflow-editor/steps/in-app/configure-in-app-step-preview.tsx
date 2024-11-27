import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePreviewStep } from '@/hooks';
import {
  InAppPreview,
  InAppPreviewAvatar,
  InAppPreviewBody,
  InAppPreviewHeader,
  InAppPreviewNotification,
  InAppPreviewNotificationContent,
  InAppPreviewSubject,
} from '@/components/workflow-editor/in-app-preview';
import { useStepEditorContext } from '@/components/workflow-editor/steps/hooks';
import { InAppRenderOutput } from '@novu/shared';

export function ConfigureInAppStepPreview() {
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

  if (!isPreviewPending && !data?.result) {
    return null;
  }

  const preview = data?.result?.preview as InAppRenderOutput | undefined;

  return (
    <InAppPreview>
      <InAppPreviewHeader />

      <InAppPreviewNotification>
        <InAppPreviewAvatar src={preview?.avatar} isPending={isPreviewPending} />

        <InAppPreviewNotificationContent>
          <InAppPreviewSubject isPending={isPreviewPending}>{preview?.subject}</InAppPreviewSubject>
          <InAppPreviewBody isPending={isPreviewPending} className="line-clamp-2">
            {preview?.body}
          </InAppPreviewBody>
        </InAppPreviewNotificationContent>
      </InAppPreviewNotification>
    </InAppPreview>
  );
}
