import { useQuery } from '@tanstack/react-query';
import { getActivityList, ActivityFilters } from '@/api/activity';
import { useEnvironment } from '../context/environment/hooks';
import { IActivity } from '@novu/shared';

interface UseActivitiesOptions {
  filters?: ActivityFilters;
  page?: number;
  limit?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

interface ActivityResponse {
  data: IActivity[];
  hasMore: boolean;
  pageSize: number;
}

export function useFetchActivities(
  { filters, page }: UseActivitiesOptions = {},
  {
    enabled = true,
    refetchInterval = false,
    refetchOnWindowFocus = false,
    staleTime = 0,
  }: { enabled?: boolean; refetchInterval?: number | false; refetchOnWindowFocus?: boolean; staleTime?: number } = {}
) {
  const { currentEnvironment } = useEnvironment();

  const { data, ...rest } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, page, filters],
    queryFn: ({ signal }) => getActivityList(currentEnvironment!, page, filters, signal),
    staleTime,
    refetchOnWindowFocus,
    refetchInterval,
    enabled: enabled && !!currentEnvironment,
  });

  return {
    activities: data?.data || [],
    hasMore: data?.hasMore || false,
    ...rest,
    page,
  };
}
