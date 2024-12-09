import { getWorkflowIdFromSlug, WORKFLOW_DIVIDER } from '@/utils/step';
import { OmitEnvironmentFromParameters } from '@/utils/types';
import { QueryKeys } from '@/utils/query-keys';
import { updateWorkflow } from '@/api/workflows';
import { useEnvironment } from '@/context/environment/hooks';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { WorkflowResponseDto } from '@novu/shared';

type UpdateWorkflowParameters = OmitEnvironmentFromParameters<typeof updateWorkflow>;

export const useUpdateWorkflow = (
  options?: UseMutationOptions<WorkflowResponseDto, unknown, UpdateWorkflowParameters>
) => {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (args: UpdateWorkflowParameters) => updateWorkflow({ environment: currentEnvironment!, ...args }),
    ...options,
    onSuccess: async (data, variables, context) => {
      const workflowId = getWorkflowIdFromSlug({ slug: data.slug, divider: WORKFLOW_DIVIDER });
      await queryClient.setQueryData([QueryKeys.fetchWorkflow, currentEnvironment?._id, workflowId], data);
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchWorkflowTestData, currentEnvironment?._id, workflowId],
      });
      options?.onSuccess?.(data, variables, context);
    },
  });

  return {
    ...mutation,
    updateWorkflow: mutation.mutateAsync,
  };
};
