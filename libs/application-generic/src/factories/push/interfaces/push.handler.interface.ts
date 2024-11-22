import {
  type IPushOptions,
  type ISendMessageSuccessResponse,
} from '@novu/stateless';
import { type ChannelTypeEnum, type ICredentials } from '@novu/shared';

export interface IPushHandler {
  canHandle(providerId: string, channelType: ChannelTypeEnum);

  buildProvider(credentials: ICredentials);

  send(smsOptions: IPushOptions): Promise<ISendMessageSuccessResponse>;
}
