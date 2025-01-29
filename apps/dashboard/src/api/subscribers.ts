import type {
  DirectionEnum,
  IEnvironment,
  IListSubscribersResponseDto,
  IRemoveSubscriberResponseDto,
} from '@novu/shared';
import { delV2, getV2 } from './api.client';

export const getSubscribers = async ({
  environment,
  after,
  before,
  limit,
  email,
  orderDirection,
  orderBy,
  phone,
  subscriberId,
  name,
}: {
  environment: IEnvironment;
  after?: string;
  before?: string;
  limit: number;
  email?: string;
  phone?: string;
  subscriberId?: string;
  name?: string;
  orderDirection?: DirectionEnum;
  orderBy?: string;
}): Promise<IListSubscribersResponseDto> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(after && { after }),
    ...(before && { before }),
    ...(orderDirection && { orderDirection }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(subscriberId && { subscriberId }),
    ...(name && { name }),
    ...(orderBy && { orderBy }),
    ...(orderDirection && { orderDirection }),
  });

  const { data } = await getV2<{ data: IListSubscribersResponseDto }>(`/subscribers?${params}`, {
    environment,
  });
  return data;
};

export const deleteSubscriber = async ({
  environment,
  subscriberId,
}: {
  environment: IEnvironment;
  subscriberId: string;
}) => {
  const { data } = await delV2<{ data: IRemoveSubscriberResponseDto }>(`/subscribers/${subscriberId}`, {
    environment,
  });
  return data;
};
