import { updateWorkflow } from '@/api/workflows';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import type { WorkflowResponseDto } from '@novu/shared';
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

export const useUpdateWorkflow = (
  options?: UseMutationOptions<WorkflowResponseDto, unknown, Parameters<typeof updateWorkflow>[0]>
) => {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateWorkflow,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.setQueryData([QueryKeys.fetchWorkflow, currentEnvironment?._id, data.slug], data);
      options?.onSuccess?.(data, variables, context);
    },
  });

  return {
    ...mutation,
    updateWorkflow: mutation.mutateAsync,
  };
};
