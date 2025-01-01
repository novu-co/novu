import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import type { IStoreQuery } from '@novu/client';
import type { IMessage, INotificationDto, IPaginatedResponse } from '@novu/shared';
import { INotificationsContext } from '../shared/interfaces';

import { useNovuContext } from './useNovuContext';
import { getNextPageParam } from '../utils/pagination';
import { useFetchNotificationsQueryKey } from './useFetchNotificationsQueryKey';

export const useFetchNotifications = (
  { query }: { query?: IStoreQuery } = {},
  options: UseInfiniteQueryOptions<IPaginatedResponse<IMessage>, Error, IPaginatedResponse<IMessage>> = {}
) => {
  const { apiService, isSessionInitialized, fetchingStrategy } = useNovuContext();
  const fetchNotificationsQueryKey = useFetchNotificationsQueryKey();

  const result = useInfiniteQuery<IPaginatedResponse<IMessage>, Error, IPaginatedResponse<IMessage>>(
    fetchNotificationsQueryKey,
    async ({ pageParam = 0 }) => await getNotificationList(apiService, pageParam, query),
    {
      ...options,
      enabled: isSessionInitialized && fetchingStrategy.fetchNotifications,
      getNextPageParam,
    }
  );

  const refetch: INotificationsContext['refetch'] = ({ page, ...otherOptions } = {}) => {
    if (page !== undefined) {
      result.fetchNextPage({ pageParam: page, ...otherOptions });
    } else {
      result.refetch(otherOptions);
    }
  };

  return {
    ...result,
    refetch,
  };
};
async function getNotificationList(apiService, pageParam: number, query) {
  const response: IPaginatedResponse<INotificationDto> = await apiService.getNotificationsList(pageParam, query);
  const messages: IMessage[] = response.data.map((notification: INotificationDto): IMessage => {
    return {
      ...notification,
      payload: notification.payload ?? {},
    };
  });

  return {
    ...response,
    data: messages,
  };
}
