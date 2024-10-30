import type { GeneratePreviewResponseDto } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { previewStep } from '@/api/workflows';

export const usePreviewStep = ({ onSuccess }: { onSuccess?: (data: GeneratePreviewResponseDto) => void } = {}) => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({
      stepUuid,
      workflowId,
      payload,
    }: {
      stepUuid: string;
      workflowId: string;
      payload?: Record<string, unknown>;
    }) => previewStep({ stepUuid, workflowId, payload }),
    onSuccess,
  });

  return {
    previewStep: mutateAsync,
    isPending,
    error,
    data,
  };
};
