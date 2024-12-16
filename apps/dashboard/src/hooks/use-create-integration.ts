import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEnvironment } from '../context/environment/hooks';
import { createIntegration } from '../api/integrations';
import { CreateIntegrationData } from '../api/integrations';

export function useCreateIntegration() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, CreateIntegrationData>({
    mutationFn: (data: CreateIntegrationData) => createIntegration(data, currentEnvironment!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
