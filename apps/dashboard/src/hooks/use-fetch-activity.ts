import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/query-keys';
import type { IActivity } from '@novu/shared';
import { useEnvironment } from '@/context/environment/hooks';
import { getNotification } from '@/api/activity';

export function useFetchActivity({ activityId }: { activityId?: string }) {
  const { currentEnvironment } = useEnvironment();

  const { data, isPending, error } = useQuery<{ data: IActivity }>({
    queryKey: [QueryKeys.fetchActivity, currentEnvironment?._id, activityId],
    queryFn: () => getNotification(activityId!, currentEnvironment!),
    enabled: !!currentEnvironment?._id && !!activityId,
  });

  return {
    activity: data?.data,
    isPending,
    error,
  };
}
