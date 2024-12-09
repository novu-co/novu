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

export function useActivities(
  { filters }: UseActivitiesOptions = {},
  { enabled = true, refetchInterval = false }: { enabled?: boolean; refetchInterval?: number | false } = {}
) {
  const { currentEnvironment } = useEnvironment();
  const [searchParams] = useSearchParams();

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const { data, isLoading, isFetching } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, offset, limit, filters],
    queryFn: () => getActivityList(currentEnvironment!, Math.floor(offset / limit), filters),
    staleTime: 0,
    enabled,
    refetchInterval,
  });

  return {
    activities: data?.data || [],
    hasMore: data?.hasMore || false,
    pageSize: limit,
    isLoading,
    isFetching,
    offset,
  };
}
