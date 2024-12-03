import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChannelTypeEnum } from '@novu/shared';
import { post } from '../api/api.client';

interface CreateIntegrationData {
  providerId: string;
  channel: ChannelTypeEnum;
  credentials: Record<string, string>;
  name: string;
  identifier: string;
  active: boolean;
}

async function createIntegration(data: CreateIntegrationData) {
  const response = await post('/integrations', data);

  return response;
}

export function useCreateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
