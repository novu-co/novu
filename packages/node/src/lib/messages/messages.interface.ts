import { ChannelTypeEnum } from '@novu/shared';

export interface IMessages {
  deleteById(messageId: string);
  list(data?: IMessagesPayload);
  deleteByTransactionId(transactionId: string);
}

export interface IMessagesPayload {
  page?: number;
  limit?: number;
  subscriberId?: string;
  channel?: ChannelTypeEnum;
  transactionIds?: string[];
}
