import { useQuery } from '@tanstack/react-query';
import { getIntegrations } from '@/api/integrations';
import { IIntegration } from '@novu/shared';

export function useIntegrations() {
  const { data: integrations, ...rest } = useQuery<IIntegration[]>({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
  });

  return {
    integrations,
    ...rest,
  };
}
