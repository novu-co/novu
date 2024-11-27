import { useQuery } from '@tanstack/react-query';
import { getIntegrations } from '@/api/integrations';

export function useIntegrations({
  refetchInterval,
  refetchOnWindowFocus,
}: { refetchInterval?: number; refetchOnWindowFocus?: boolean } = {}) {
  const { data: integrations, ...rest } = useQuery<any[]>({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
    refetchInterval,
    refetchOnWindowFocus,
  });

  return {
    integrations,
    ...rest,
  };
}
