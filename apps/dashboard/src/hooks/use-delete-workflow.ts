import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { deleteWorkflow } from '@/api/workflows';
import { QueryKeys } from '@/utils/query-keys';

export const useDeleteWorkflow = (
  options?: UseMutationOptions<void, unknown, Parameters<typeof deleteWorkflow>[0]>
) => {
  const queryClient = useQueryClient();

  const { mutateAsync, ...rest } = useMutation({
    mutationFn: deleteWorkflow,
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
    deleteWorkflow: mutateAsync,
  };
};
