import { getV2, NovuApiError } from '@/api/api.client';
import { promoteWorkflow } from '@/api/workflows';
import { promoteToast } from '@/components/primitives/sonner-helpers';
import { useEnvironment } from '@/context/environment/hooks';
import { WorkflowListResponseDto, WorkflowOriginEnum, WorkflowResponseDto, WorkflowStatusEnum } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

const PRODUCTION_ENVIRONMENT = 'Production' as const;

export function usePromoteWorkflow(workflow: WorkflowListResponseDto) {
  const { environments, switchEnvironment } = useEnvironment();
  const [isLoading, setIsLoading] = useState(false);
  let loadingToast: string | number | undefined = undefined;

  const isPromotable = useMemo(
    () => workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && workflow.status !== WorkflowStatusEnum.ERROR,
    [workflow.origin, workflow.status]
  );

  const getProductionEnvironmentId = useCallback(() => {
    return environments?.find((environment) => environment.name === PRODUCTION_ENVIRONMENT)?._id || '';
  }, [environments]);

  const getTooltipContent = () => {
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      return 'External workflows cannot be promoted to Production using dashboard.';
    }

    if (workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1) {
      return 'V1 workflows cannot be promoted to Production using dashboard. Please visit the legacy portal.';
    }

    if (workflow.status === WorkflowStatusEnum.ERROR) {
      return 'This workflow has errors and cannot be promoted to Production. Please fix the errors first.';
    }
  };

  const safePromote = async () => {
    try {
      if (await isWorkflowInProduction()) {
        return { needsConfirmation: true };
      }
    } catch (error) {
      if (error instanceof NovuApiError && error.status === 404) {
        return { needsConfirmation: false };
      }

      toast.error('Failed to promote workflow', {
        description: error instanceof Error ? error.message : 'There was an error promoting the workflow.',
      });

      return { needsConfirmation: false };
    }

    await promoteWorkflowMutation();

    return { needsConfirmation: false };
  };

  const isWorkflowInProduction = async () => {
    const { data: workflowInProd } = await getV2<{ data: WorkflowResponseDto }>(
      `/workflows/${workflow.workflowId}?environmentId=${getProductionEnvironmentId()}`
    );

    return !!workflowInProd;
  };

  const onPromoteSuccess = () => {
    toast.dismiss(loadingToast);
    setIsLoading(false);

    promoteToast({
      title: 'Workflow promoted to Production',
      description: `Workflow '${workflow.name}' has been successfully promoted to production.`,
      action: {
        label: 'Switch to production',
        onClick: () => switchEnvironment(getProductionEnvironmentId()),
      },
    });
  };

  const onPromoteError = (error: unknown) => {
    toast.dismiss(loadingToast);
    setIsLoading(false);

    toast.error('Failed to promote workflow', {
      description: error instanceof Error ? error.message : 'There was an error promoting the workflow.',
    });
  };

  const { mutateAsync: promoteWorkflowMutation } = useMutation({
    mutationFn: async () =>
      promoteWorkflow(workflow._id, { targetEnvironmentId: getProductionEnvironmentId() }).then((res) => res.data),
    onMutate: () => {
      setIsLoading(true);
      loadingToast = toast.loading('Promoting workflow...');
    },
    onSuccess: onPromoteSuccess,
    onError: onPromoteError,
  });

  return {
    safePromote,
    isPromotable,
    isLoading,
    tooltipContent: getTooltipContent(),
    promote: promoteWorkflowMutation,
  };
}
