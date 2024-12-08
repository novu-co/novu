import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { getNotification } from '@/api/activity';
import type { Activity } from './use-activities';

export function useFetchActivity({ activityId }: { activityId?: string }) {
  const { currentEnvironment } = useEnvironment();

  const { data, isPending, error } = useQuery<{ data: Activity }>({
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
