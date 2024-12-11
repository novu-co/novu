import { useQuery } from '@tanstack/react-query';
import { IProviderConfig, providers as novuProviders } from '@novu/shared';

export function useProviders() {
  const { data: providers, isLoading } = useQuery<IProviderConfig[]>({
    queryKey: ['providers'],
    queryFn: () => novuProviders,
  });

  return {
    providers,
    isLoading,
  };
}
