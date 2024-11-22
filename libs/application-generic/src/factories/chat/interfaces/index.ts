import {
  type IChatOptions,
  type ISendMessageSuccessResponse,
} from '@novu/stateless';
import { type IntegrationEntity } from '@novu/dal';
import { type ChannelTypeEnum, type ICredentials } from '@novu/shared';

export interface IChatHandler {
  canHandle(providerId: string, channelType: ChannelTypeEnum);
  buildProvider(credentials: ICredentials);
  send(chatData: IChatOptions): Promise<ISendMessageSuccessResponse>;
}

export interface IChatFactory {
  getHandler(integration: IntegrationEntity): IChatHandler | null;
}
