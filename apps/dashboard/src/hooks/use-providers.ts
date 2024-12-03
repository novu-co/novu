import { useQuery } from '@tanstack/react-query';
import { ChannelTypeEnum, providers as novuProviders } from '@novu/shared';

export interface IProvider {
  id: string;
  displayName: string;
  channel: ChannelTypeEnum;
  credentials: Array<{
    key: string;
    displayName: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  description?: string;
  logoFileName: {
    light: string;
    dark: string;
  };
}

export function useProviders() {
  const { data: providers, isLoading } = useQuery<IProvider[]>({
    queryKey: ['providers'],
    queryFn: () => novuProviders,
  });

  return {
    providers,
    isLoading,
  };
}
