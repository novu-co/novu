import { getV2, NovuApiError } from '@/api/api.client';
import { syncWorkflow } from '@/api/workflows';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { SuccessButtonToast } from '@/components/success-button-toast';
import TruncatedText from '@/components/truncated-text';
import { useEnvironment } from '@/context/environment/hooks';
import type { IEnvironment, WorkflowListResponseDto, WorkflowResponseDto } from '@novu/shared';
import { WorkflowOriginEnum, WorkflowStatusEnum } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '@/utils/routes';

export function useSyncWorkflow(workflow: WorkflowResponseDto | WorkflowListResponseDto) {
  const { currentEnvironment, oppositeEnvironment, switchEnvironment } = useEnvironment();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  let loadingToast: string | number | undefined = undefined;

  const isSyncable = useMemo(
    () => workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && workflow.status !== WorkflowStatusEnum.ERROR,
    [workflow.origin, workflow.status]
  );

  // TODO: Move UI logic outside of a hook to the Sync related UI component
  const getTooltipContent = () => {
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      return `Code-first workflows cannot be synced to ${oppositeEnvironment?.name} using dashboard.`;
    }

    if (workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1) {
      return `V1 workflows cannot be synced to ${oppositeEnvironment?.name} using dashboard. Please visit the legacy portal.`;
    }

    if (workflow.status === WorkflowStatusEnum.ERROR) {
      return `This workflow has errors and cannot be synced to ${oppositeEnvironment?.name}. Please fix the errors first.`;
    }
  };

  const safeSync = async () => {
    try {
      if (await isWorkflowInTargetEnvironment()) {
        setShowConfirmModal(true);

        return;
      }
    } catch (error) {
      if (error instanceof NovuApiError && error.status === 404) {
        await syncWorkflowMutation();

        return;
      }

      toast.error('Failed to sync workflow', {
        description: error instanceof Error ? error.message : 'There was an error syncing the workflow.',
      });
    }
  };

  const onSyncSuccess = (workflow: WorkflowResponseDto, environment?: IEnvironment) => {
    toast.dismiss(loadingToast);
    setIsLoading(false);

    // TODO: Move UI logic outside of a hook to the Sync related UI component
    return showToast({
      variant: 'lg',
      className: 'gap-3',
      children: ({ close }) => (
        <SuccessButtonToast
          title={`Workflow synced to ${environment?.name}`}
          description={
            <>
              Workflow <span className="font-bold">{workflow.name}</span> has been successfully synced to{' '}
              {environment?.name}.
            </>
          }
          actionLabel={`Switch to ${environment?.name}`}
          onAction={() => {
            close();
            const targetSlug = environment?.slug || '';
            switchEnvironment(targetSlug);

            navigate(buildRoute(ROUTES.WORKFLOWS, { environmentSlug: targetSlug }));
          }}
          onClose={close}
        />
      ),
      options: {
        position: 'bottom-right',
      },
    });
  };

  const onSyncError = (error: unknown) => {
    toast.dismiss(loadingToast);
    setIsLoading(false);

    toast.error('Failed to sync workflow', {
      description: error instanceof Error ? error.message : 'There was an error syncing the workflow.',
    });
  };

  const { mutateAsync: syncWorkflowMutation, isPending } = useMutation({
    mutationFn: async () =>
      syncWorkflow({
        environment: currentEnvironment!,
        workflowSlug: workflow.slug,
        payload: { targetEnvironmentId: oppositeEnvironment?._id || '' },
      }).then((res) => ({ workflow: res.data, environment: oppositeEnvironment || undefined })),
    onMutate: async () => {
      setIsLoading(true);
      loadingToast = toast.loading(
        <>
          <ToastIcon variant="default" className="animate-spin" />
          <span className="text-sm">
            Syncing workflow <span className="font-bold">{workflow.name}</span> to {oppositeEnvironment?.name}...
          </span>
        </>
      );
    },
    onSuccess: ({ workflow, environment }) => onSyncSuccess(workflow, environment),
    onError: onSyncError,
  });

  const { mutateAsync: isWorkflowInTargetEnvironment } = useMutation({
    mutationFn: async () => {
      const { data } = await getV2<{ data: WorkflowResponseDto }>(
        `/workflows/${workflow.workflowId}?environmentId=${oppositeEnvironment?._id || ''}`,
        { environment: currentEnvironment! }
      );
      return data;
    },
  });

  return {
    safeSync,
    sync: syncWorkflowMutation,
    isSyncable,
    isLoading,
    tooltipContent: getTooltipContent(),
    PromoteConfirmModal: () => (
      <ConfirmationModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={() => {
          syncWorkflowMutation();
          setShowConfirmModal(false);
        }}
        title={`Sync workflow to ${oppositeEnvironment?.name}`}
        description={
          <>
            Workflow <TruncatedText className="max-w-[32ch] font-bold">{workflow.name}</TruncatedText> already exists in{' '}
            {oppositeEnvironment?.name}.<br />
            <br />
            Proceeding will overwrite the existing workflow.
          </>
        }
        confirmButtonText="Proceed"
        isLoading={isPending}
      />
    ),
  };
}
