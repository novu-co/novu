import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChannelTypeEnum, IEnvironment } from '@novu/shared';
import { post } from '../api/api.client';
import { useEnvironment } from '../context/environment/hooks';

interface CreateIntegrationData {
  providerId: string;
  channel: ChannelTypeEnum;
  credentials: Record<string, string>;
  name: string;
  identifier: string;
  active: boolean;
  primary?: boolean;
}

async function createIntegration(data: CreateIntegrationData, environment: IEnvironment) {
  const response = await post('/integrations', {
    body: data,
    environment: environment,
  });

  return response;
}

export function useCreateIntegration() {
  const { currentEnvironment } = useEnvironment();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIntegrationData) => createIntegration(data, currentEnvironment!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
