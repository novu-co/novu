import { IActivity, IEnvironment } from '@novu/shared';
import { get } from './api.client';

export type ActivityFilters = {
  channels?: string[];
  workflows?: string[];
  email?: string;
  subscriberId?: string;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
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

  if (filters?.startDate) {
    searchParams.append('startDate', filters.startDate);
  }
  if (filters?.endDate) {
    searchParams.append('endDate', filters.endDate);
  }

  return get<ActivityResponse>(`/notifications?${searchParams.toString()}`, {
    environment,
    signal,
  });
}

export function getNotification(notificationId: string, environment: IEnvironment) {
  return get<{ data: IActivity }>(`/notifications/${notificationId}`, {
    environment,
  });
}
