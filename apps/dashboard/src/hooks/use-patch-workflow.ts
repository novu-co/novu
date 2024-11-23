import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { WorkflowResponseDto } from '@novu/shared';
import { patchWorkflow } from '@/api/workflows';
import { QueryKeys } from '@/utils/query-keys';

export const usePatchWorkflow = (
  options?: UseMutationOptions<WorkflowResponseDto, unknown, Parameters<typeof patchWorkflow>[0]>
) => {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: patchWorkflow,
    ...options,
    onSuccess: async (data, variables, ctx) => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchWorkflows],
      });

      options?.onSuccess?.(data, variables, ctx);
    },
  });

  return {
    ...rest,
    patchWorkflow: mutateAsync,
  };
};
