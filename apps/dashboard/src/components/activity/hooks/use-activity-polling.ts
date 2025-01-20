import { JobStatusEnum } from '@novu/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useEnvironment } from '@/context/environment/hooks';
import { useFetchActivity } from '@/hooks/use-fetch-activity';
import { QueryKeys } from '@/utils/query-keys';

interface UseActivityPollingProps {
  activityId?: string;
}

export function useActivityPolling({ activityId }: UseActivityPollingProps) {
  const queryClient = useQueryClient();
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { currentEnvironment } = useEnvironment();

  const { activity, isPending, error } = useFetchActivity(
    { activityId: activityId ?? '' },
    {
      refetchInterval: shouldRefetch ? 1000 : false,
    }
  );

  useEffect(() => {
    if (!activity) return;

    const isPending = activity.jobs?.some(
      (job) =>
        job.status === JobStatusEnum.PENDING ||
        job.status === JobStatusEnum.QUEUED ||
        job.status === JobStatusEnum.RUNNING ||
        job.status === JobStatusEnum.DELAYED
    );

    setShouldRefetch(isPending || !activity?.jobs?.length);

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.fetchActivity, currentEnvironment?._id, activityId],
    });
  }, [activity, queryClient, currentEnvironment, activityId]);

  return {
    activity,
    isPending,
    error,
  };
}
