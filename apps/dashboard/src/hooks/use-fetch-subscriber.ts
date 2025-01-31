import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IGetSubscriberResponseDto } from '@novu/shared';
import { getSubscriber } from '@/api/subscribers';
import { useAuth } from '@/context/auth/hooks';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';

export type SubscriberResponse = Awaited<ReturnType<typeof getSubscriber>>;

type Props = {
  subscriberId: string;
  options?: Omit<UseQueryOptions<SubscriberResponse, Error>, 'queryKey' | 'queryFn'>;
};

export default function useFetchSubscriber({ subscriberId, options = {} }: Props) {
  const { currentOrganization } = useAuth();
  const { currentEnvironment } = useEnvironment();

  const subscriberQuery = useQuery<IGetSubscriberResponseDto>({
    queryKey: [QueryKeys.fetchSubscriber, currentOrganization?._id, currentEnvironment?._id],
    queryFn: () => getSubscriber({ environment: currentEnvironment!, subscriberId }),
    enabled: !!currentOrganization,
    ...options,
  });

  return subscriberQuery;
}
