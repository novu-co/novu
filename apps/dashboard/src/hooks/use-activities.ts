import { useQuery } from '@tanstack/react-query';
import { getActivityList, IActivityFilters } from '@/api/activity';
import { useEnvironment } from '../context/environment/hooks';

interface UseActivitiesOptions {
  page?: number;
  filters?: IActivityFilters;
}

type ExecutionStatus = 'Success' | 'Pending' | 'Failed';

interface ExecutionDetail {
  _id: string;
  _jobId: string;
  providerId: string;
  detail: string;
  source: string;
  status: ExecutionStatus;
  isTest: boolean;
  isRetry: boolean;
  raw?: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Job {
  _id: string;
  status: 'completed' | 'failed' | 'pending';
  payload: Record<string, unknown>;
  type: string;
  providerId: string;
  executionDetails: ExecutionDetail[];
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface Template {
  _id: string;
  name: string;
  triggers: Array<{
    type: string;
    identifier: string;
    variables: unknown[];
    subscriberVariables: unknown[];
    _id: string;
    id: string;
  }>;
  id: string;
}

interface Subscriber {
  _id: string;
  subscriberId: string;
  id: string;
}

export interface Activity {
  _id: string;
  _templateId: string;
  _environmentId: string;
  _organizationId: string;
  _subscriberId: string;
  transactionId: string;
  channels: string[];
  to: {
    subscriberId: string;
  };
  payload: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  template: Template;
  subscriber: Subscriber;
  jobs: Job[];
  id: string;
}

interface ActivityResponse {
  data: Activity[];
  hasMore: boolean;
  pageSize: number;
}

export function useActivities({ page = 0, filters }: UseActivitiesOptions = {}) {
  const { currentEnvironment } = useEnvironment();

  const { data, isLoading, isFetching } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, page, filters],
    queryFn: () => getActivityList(currentEnvironment!, page, filters),
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    activities: data?.data || [],
    hasMore: data?.hasMore || false,
    pageSize: data?.pageSize || 10,
    isLoading,
    isFetching,
  };
}
