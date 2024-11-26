import { useQuery } from '@tanstack/react-query';
import { getIntegrations } from '@/api/integrations';

export function useIntegrations() {
  const { data: integrations, ...rest } = useQuery<any[]>({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
  });

  return {
    integrations,
    ...rest,
  };
}
