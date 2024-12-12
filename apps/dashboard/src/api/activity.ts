import { IActivity, IEnvironment } from '@novu/shared';
import { get } from './api.client';

export type ActivityFilters = {
  channels?: string[];
  workflows?: string[];
  email?: string;
  subscriberId?: string;
  transactionId?: string;
  dateRange?: string;
};

interface ActivityResponse {
  data: IActivity[];
  hasMore: boolean;
  pageSize: number;
}

export function getActivityList(
  environment: IEnvironment,
  page = 0,
  filters?: ActivityFilters,
  signal?: AbortSignal
): Promise<ActivityResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());

  if (filters?.channels?.length) {
    filters.channels.forEach((channel) => {
      searchParams.append('channels', channel);
    });
  }

  if (filters?.workflows?.length) {
    filters.workflows.forEach((workflow) => {
      searchParams.append('templates', workflow);
    });
  }

  if (filters?.email) {
    searchParams.append('emails', filters.email);
  }

  if (filters?.subscriberId) {
    searchParams.append('subscriberIds', filters.subscriberId);
  }

  if (filters?.transactionId) {
    searchParams.append('transactionId', filters.transactionId);
  }

  if (filters?.dateRange) {
    const after = new Date(Date.now() - getDateRangeInDays(filters?.dateRange) * 24 * 60 * 60 * 1000);
    searchParams.append('after', after.toISOString());
  }

  return get<ActivityResponse>(`/notifications?${searchParams.toString()}`, {
    environment,
    signal,
  });
}

function getDateRangeInDays(range: string): number {
  switch (range) {
    case '24h':
      return 1;
    case '7d':
      return 7;
    case '30d':
    default:
      return 30;
  }
}

export function getNotification(notificationId: string, environment: IEnvironment) {
  return get<{ data: IActivity }>(`/notifications/${notificationId}`, {
    environment,
  });
}
