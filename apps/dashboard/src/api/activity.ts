import { IEnvironment } from '@novu/shared';
import { get } from './api.client';
import type { Activity } from '@/hooks/use-activities';

export interface IActivityFilters {
  channels?: string[];
  templates?: string[];
  email?: string;
  subscriberId?: string;
  transactionId?: string;
}

interface ActivityResponse {
  data: Activity[];
  hasMore: boolean;
  pageSize: number;
}

export function getActivityList(
  environment: IEnvironment,
  page = 0,
  filters?: IActivityFilters
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

  return get<ActivityResponse>(`/notifications?${searchParams.toString()}`, {
    environment,
  });
}

export function getActivityStats() {
  return get<{ stats: any }>('/notifications/stats');
}

export function getActivityGraphStats() {
  return get<{ stats: any }>('/notifications/graph/stats');
}

export function getNotification(notificationId: string) {
  return get<{ notification: Activity }>(`/notifications/${notificationId}`);
}
