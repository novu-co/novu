import { useQuery } from '@tanstack/react-query';
import { getActivityList, IActivityFilters } from '@/api/activity';
import { useEnvironment } from '../context/environment/hooks';
import { useSearchParams } from 'react-router-dom';

interface UseActivitiesOptions {
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
  status: 'completed' | 'failed' | 'pending' | 'merged' | 'delayed';
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
  slug: string;
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
  _digestedNotificationId?: string;
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

export function useActivities({ filters }: UseActivitiesOptions = {}) {
  const { currentEnvironment } = useEnvironment();
  const [searchParams] = useSearchParams();

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const { data, isLoading, isFetching } = useQuery<ActivityResponse>({
    queryKey: ['activitiesList', currentEnvironment?._id, offset, limit, filters],
    queryFn: () => getActivityList(currentEnvironment!, Math.floor(offset / limit), filters),
    staleTime: 1000 * 60, // 1 minute
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
