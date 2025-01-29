import { DirectionEnum } from '../../types/response';
import { SubscriberDto } from './subscriber.dto';

export interface IListSubscribersRequestDto {
  limit: number;

  before?: string;

  after?: string;

  orderDirection: DirectionEnum;

  orderBy: 'updatedAt' | '_id';

  email?: string;

  phone?: string;

  subscriberId?: string;

  name?: string;
}

export interface IListSubscribersResponseDto {
  subscribers: SubscriberDto[];

  next: string | null;

  previous: string | null;
}
