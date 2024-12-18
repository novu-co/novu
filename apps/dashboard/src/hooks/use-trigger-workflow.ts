import { useMutation } from '@tanstack/react-query';
import { triggerWorkflow } from '@/api/workflows';
import { IEnvironment } from '@novu/shared';

export const useTriggerWorkflow = (environment?: IEnvironment) => {
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({ name, to, payload }: { name: string; to: unknown; payload: unknown }) =>
      triggerWorkflow({ environment: environment!, name, to, payload }),
  });

  return {
    triggerWorkflow: mutateAsync,
    isPending,
    error,
    data,
  };
};
