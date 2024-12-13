import { useMutation } from '@tanstack/react-query';
import { triggerWorkflow } from '@/api/workflows';
import { useEnvironment } from '@/context/environment/hooks';

export const useTriggerWorkflow = () => {
  const { currentEnvironment } = useEnvironment();
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: async ({ name, to, payload }: { name: string; to: unknown; payload: unknown }) =>
      triggerWorkflow({ environment: currentEnvironment!, name, to, payload }),
  });

  return {
    triggerWorkflow: mutateAsync,
    isPending,
    error,
    data,
  };
};
