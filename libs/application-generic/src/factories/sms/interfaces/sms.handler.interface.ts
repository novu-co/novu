import {
  ISendMessageSuccessResponse,
  ISmsOptions,
  ISmsProvider,
} from '@novu/stateless';
import { ChannelTypeEnum, ICredentials } from '@novu/shared';

export interface ISmsHandler {
  canHandle(providerId: string, channelType: ChannelTypeEnum);

  buildProvider(credentials: ICredentials);

  send(
    smsOptions: ISmsOptions,
    bridgeProviderData: Record<string, unknown>
  ): Promise<ISendMessageSuccessResponse>;

  getProvider(): ISmsProvider;
}
