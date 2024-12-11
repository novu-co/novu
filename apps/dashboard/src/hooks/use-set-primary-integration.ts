import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api/api.client';
import { useEnvironment } from '../context/environment/hooks';

interface SetPrimaryIntegrationParams {
  integrationId: string;
}

export function useSetPrimaryIntegration() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ integrationId }: SetPrimaryIntegrationParams) => {
      return post(`/integrations/${integrationId}/set-primary`, {
        environment: currentEnvironment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
