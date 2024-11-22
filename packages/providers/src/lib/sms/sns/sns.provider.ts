import {
  ChannelTypeEnum,
  type ISendMessageSuccessResponse,
  type ISmsOptions,
  type ISmsProvider,
} from '@novu/stateless';
import {
  PublishCommand,
  type PublishCommandInput,
  SNSClient,
} from '@aws-sdk/client-sns';

import { SmsProviderIdEnum } from '@novu/shared';
import { type SNSConfig } from './sns.config';
import { BaseProvider, CasingEnum } from '../../../base.provider';
import { type WithPassthrough } from '../../../utils/types';

export class SNSSmsProvider extends BaseProvider implements ISmsProvider {
  id = SmsProviderIdEnum.SNS;
  protected casing: CasingEnum = CasingEnum.PASCAL_CASE;
  channelType = ChannelTypeEnum.SMS as ChannelTypeEnum.SMS;
  private client: SNSClient;

  constructor(private readonly config: SNSConfig) {
    super();
    this.client = new SNSClient({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async sendMessage(
    options: ISmsOptions,
    bridgeProviderData: WithPassthrough<Record<string, unknown>> = {},
  ): Promise<ISendMessageSuccessResponse> {
    const { to, content } = options;

    const publish = new PublishCommand(
      this.transform<PublishCommandInput>(bridgeProviderData, {
        PhoneNumber: to,
        Message: content,
      }).body,
    );

    const snsResponse = await this.client.send(publish);

    return {
      id: snsResponse.MessageId,
      date: new Date().toISOString(),
    };
  }
}
