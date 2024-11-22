import {
  type ISendMessageSuccessResponse,
  type ISmsOptions,
  type ISmsProvider,
} from '@novu/stateless';
import { type ChannelTypeEnum, type ICredentials } from '@novu/shared';

export interface ISmsHandler {
  canHandle(providerId: string, channelType: ChannelTypeEnum);

  buildProvider(credentials: ICredentials);

  send(smsOptions: ISmsOptions): Promise<ISendMessageSuccessResponse>;

  getProvider(): ISmsProvider;
}
