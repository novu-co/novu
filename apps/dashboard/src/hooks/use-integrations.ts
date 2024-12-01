import { useQuery } from '@tanstack/react-query';
import { getIntegrations } from '@/api/integrations';
import { IIntegration } from '@novu/shared';

export function useIntegrations({
  refetchInterval,
  refetchOnWindowFocus,
}: { refetchInterval?: number; refetchOnWindowFocus?: boolean } = {}) {
  const { data: integrations, ...rest } = useQuery<IIntegration[]>({
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
