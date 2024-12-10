import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IIntegration } from '@novu/shared';
import { put } from '../api/api.client';
import { useEnvironment } from '../context/environment/hooks';

interface UpdateIntegrationData {
  name: string;
  identifier: string;
  active: boolean;
  primary: boolean;
  credentials: Record<string, string>;
}

interface UpdateIntegrationVariables {
  integrationId: string;
  data: UpdateIntegrationData;
}

export function useUpdateIntegration() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  return useMutation<IIntegration, Error, UpdateIntegrationVariables>({
    mutationFn: async ({ integrationId, data }) => {
      const response = await put<IIntegration>(`/v1/integrations/${integrationId}`, {
        body: data,
        environment: currentEnvironment,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
