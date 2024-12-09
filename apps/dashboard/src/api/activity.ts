import { IActivity, IEnvironment } from '@novu/shared';
import { get } from './api.client';

export interface IActivityFilters {
  channels?: string[];
  templates?: string[];
  email?: string;
  subscriberId?: string;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
}

interface ActivityResponse {
  data: IActivity[];
  hasMore: boolean;
  pageSize: number;
}

export function getActivityList(
  environment: IEnvironment,
  page = 0,
  filters?: IActivityFilters,
  signal?: AbortSignal
): Promise<ActivityResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());

  if (filters?.channels?.length) {
    searchParams.append('channels', filters.channels.join(','));
  }
  if (filters?.templates?.length) {
    searchParams.append('templates', filters.templates.join(','));
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
