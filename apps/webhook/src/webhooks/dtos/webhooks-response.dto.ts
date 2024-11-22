import { type IEventBody } from '@novu/stateless';

export interface IWebhookResult {
  id: string;
  event: IEventBody;
}
