import type { GeneratePreviewResponseDto } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { previewStep } from '@/api/workflows';

export const usePreviewStep = ({ onSuccess }: { onSuccess?: (data: GeneratePreviewResponseDto) => void } = {}) => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({
      stepId,
      workflowSlug,
      payload,
    }: {
      stepId: string;
      workflowSlug: string;
      payload?: Record<string, unknown>;
    }) => previewStep({ stepId, workflowSlug, payload }),
    onSuccess,
  });

  return {
    previewStep: mutateAsync,
    isPending,
    error,
    data,
  };
};
