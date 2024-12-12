import { useQuery } from '@tanstack/react-query';
import { getActivityList, IActivityFilters } from '@/api/activity';
import { useEnvironment } from '../context/environment/hooks';
import { IActivity } from '@novu/shared';

interface UseActivitiesOptions {
  filters?: IActivityFilters;
  page?: number;
  limit?: number;
}

interface ActivityResponse {
  data: IActivity[];
  hasMore: boolean;
  pageSize: number;
}

export function useFetchActivities({ filters, page }: UseActivitiesOptions = {}) {
  const { currentEnvironment } = useEnvironment();

  const { data, ...rest } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, page, filters],
    queryFn: () => getActivityList(currentEnvironment!, page, filters),
    staleTime: 0,
    enabled: !!currentEnvironment,
  });

  return {
    activities: data?.data || [],
    hasMore: data?.hasMore || false,
    ...rest,
    page,
  };
}
