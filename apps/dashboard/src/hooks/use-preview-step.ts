import type { GeneratePreviewResponseDto } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { previewStep } from '@/api/workflows';

export const usePreviewStep = ({
  onSuccess,
  onError,
}: { onSuccess?: (data: GeneratePreviewResponseDto) => void; onError?: (error: Error) => void } = {}) => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: previewStep,
    onSuccess,
    onError,
  });

  return {
    previewStep: mutateAsync,
    isPending,
    error,
    data,
  };
};
