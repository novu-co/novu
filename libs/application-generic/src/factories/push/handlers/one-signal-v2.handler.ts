import {
  ChannelTypeEnum,
  ICredentials,
  PushProviderIdEnum,
} from '@novu/shared';
import { OneSignalV2PushProvider } from '@novu/providers';
import { BasePushHandler } from './base.handler';

export class OneSignalV2Handler extends BasePushHandler {
  constructor() {
    super(PushProviderIdEnum.OneSignalV2, ChannelTypeEnum.PUSH);
  }

  buildProvider(credentials: ICredentials) {
    if (!credentials.apiKey || !credentials.applicationId) {
      throw Error('Config is not valid for OneSignal');
    }

    this.provider = new OneSignalV2PushProvider({
      appId: credentials.applicationId,
      apiKey: credentials.apiKey,
    });
  }
}
