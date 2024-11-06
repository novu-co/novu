import { useMutation } from '@tanstack/react-query';
import type { UpdateWorkflowDto, WorkflowResponseDto } from '@novu/shared';
import { updateWorkflow } from '@/api/workflows';

export const useUpdateWorkflow = ({
  onSuccess,
  onError,
}: { onSuccess?: (data: WorkflowResponseDto) => void; onError?: (error: unknown) => void } = {}) => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({ id, workflow }: { id: string; workflow: UpdateWorkflowDto }) =>
      updateWorkflow({ id, workflow }),
    onSuccess,
    onError,
  });

  return {
    updateWorkflow: mutateAsync,
    isPending,
    error,
    data,
  };
};
