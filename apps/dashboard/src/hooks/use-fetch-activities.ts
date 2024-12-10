import { useQuery } from '@tanstack/react-query';
import { getActivityList, IActivityFilters } from '@/api/activity';
import { useEnvironment } from '../context/environment/hooks';
import { useSearchParams } from 'react-router-dom';
import { IActivity } from '@novu/shared';

interface UseActivitiesOptions {
  filters?: IActivityFilters;
}

interface ActivityResponse {
  data: IActivity[];
  hasMore: boolean;
  pageSize: number;
}

export function useFetchActivities({ filters }: UseActivitiesOptions = {}) {
  const { currentEnvironment } = useEnvironment();
  const [searchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const { data, ...rest } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, page, limit, filters],
    queryFn: ({ signal }) => getActivityList(currentEnvironment!, page, filters, signal),
    staleTime: 0,
    enabled: !!currentEnvironment,
  });

  return {
    activities: data?.data || [],
    hasMore: data?.hasMore || false,
    pageSize: limit,
    ...rest,
    page,
  };
}
