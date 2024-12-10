import * as Sentry from '@sentry/react';
import { HTMLAttributes, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useStep } from '@/components/workflow-editor/steps/step-provider';
import { usePreviewStep } from '@/hooks/use-preview-step';
import { EmailPreviewHeader } from '@/components/workflow-editor/steps/email/email-preview';
import { Separator } from '@/components/primitives/separator';
import { Skeleton } from '@/components/primitives/skeleton';
import { ChannelTypeEnum } from '@novu/shared';
import { cn } from '@/utils/ui';

type MiniEmailPreviewProps = HTMLAttributes<HTMLDivElement>;
const MiniEmailPreview = (props: MiniEmailPreviewProps) => {
  const { className, children, ...rest } = props;
  return (
    <div
      className={cn(
        'border-neutral-alpha-200 before:to-background relative isolate mb-4 rounded-lg border border-dashed before:pointer-events-none before:absolute before:inset-0 before:-m-px before:rounded-lg before:bg-gradient-to-b before:from-transparent before:bg-clip-padding',
        className
      )}
      {...rest}
    >
      <div className="flex flex-col gap-1 py-1">
        <EmailPreviewHeader className="px-2 text-sm" />
        <Separator className="bg-neutral-alpha-100" />
        <div className="relative z-10 space-y-1 px-2">{children}</div>
      </div>
    </div>
  );
};

type ConfigureEmailStepPreviewProps = HTMLAttributes<HTMLDivElement>;
export function ConfigureEmailStepPreview(props: ConfigureEmailStepPreviewProps) {
  const {
    previewStep,
    data: previewData,
    isPending: isPreviewPending,
  } = usePreviewStep({
    onError: (error) => Sentry.captureException(error),
  });
  const { step, isPending } = useStep();

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

  if (isPreviewPending) {
    return (
      <MiniEmailPreview>
        <Skeleton className="h-5 w-full max-w-[25ch]" />
        <Skeleton className="h-5 w-full max-w-[15ch]" />
      </MiniEmailPreview>
    );
  }

  if (previewData?.result?.type !== ChannelTypeEnum.EMAIL) {
    return <MiniEmailPreview>No preview available</MiniEmailPreview>;
  }

  return (
    <MiniEmailPreview {...props}>
      <div className="text-foreground-400 line-clamp-2 text-xs">{previewData.result.preview.subject}</div>
    </MiniEmailPreview>
  );
}
