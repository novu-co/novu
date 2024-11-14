import { updateWorkflow } from '@/api/workflows';
import type { WorkflowResponseDto } from '@novu/shared';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export const useUpdateWorkflow = (
  options?: UseMutationOptions<WorkflowResponseDto, unknown, Parameters<typeof updateWorkflow>[0]>
) => {
  const mutation = useMutation({
    mutationFn: updateWorkflow,
    ...options,
  });

  return {
    ...mutation,
    updateWorkflow: mutation.mutateAsync,
  };
};
