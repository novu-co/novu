import { type ISubscriberJwt } from '@novu/shared';

export interface ISession {
  token: string;
  profile: ISubscriberJwt;
}
