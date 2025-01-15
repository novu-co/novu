import type { DirectionEnum, IEnvironment, IListSubscribersResponseDto } from '@novu/shared';
import { getV2 } from './api.client';

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
