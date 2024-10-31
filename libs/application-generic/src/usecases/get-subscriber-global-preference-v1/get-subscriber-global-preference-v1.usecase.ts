import { Injectable } from '@nestjs/common';
import {
  PreferenceLevelEnum,
  SubscriberEntity,
  SubscriberPreferenceRepository,
  SubscriberRepository,
} from '@novu/dal';

import { IPreferenceChannels, ChannelTypeEnum } from '@novu/shared';
import { GetSubscriberGlobalPreferenceCommandV1 } from './get-subscriber-global-preference-v1.command';
import { buildSubscriberKey, CachedEntity } from '../../services/cache';
import { ApiException } from '../../utils/exceptions';
import { GetPreferences } from '../get-preferences';
import { GetSubscriberPreference } from '../get-subscriber-preference/get-subscriber-preference.usecase';
import { filteredPreference } from '../get-subscriber-template-preference/get-subscriber-template-preference.usecase';

/** @deprecated - use `GetPreferences` instead */
@Injectable()
export class GetSubscriberGlobalPreferenceV1 {
  constructor(
    private subscriberPreferenceRepository: SubscriberPreferenceRepository,
    private subscriberRepository: SubscriberRepository,
  ) {}

  async execute(command: GetSubscriberGlobalPreferenceCommandV1) {
    const subscriber = await this.getSubscriber(command);

    const subscriberGlobalPreference = await this.getSubscriberGlobalPreference(
      command,
      subscriber._id,
    );

    const channelsWithDefaults = this.buildDefaultPreferences(
      subscriberGlobalPreference.channels,
    );

    return {
      preference: {
        enabled: subscriberGlobalPreference.enabled,
        channels: channelsWithDefaults,
      },
    };
  }

  private async getSubscriberGlobalPreference(
    command: GetSubscriberGlobalPreferenceCommandV1,
    subscriberId: string,
  ): Promise<{
    channels: IPreferenceChannels;
    enabled: boolean;
  }> {
    const subscriberGlobalPreferenceV1 =
      await this.subscriberPreferenceRepository.findOne({
        _environmentId: command.environmentId,
        _subscriberId: subscriberId,
        level: PreferenceLevelEnum.GLOBAL,
      });

    const subscriberGlobalChannels =
      subscriberGlobalPreferenceV1?.channels ?? {};
    const enabled = subscriberGlobalPreferenceV1?.enabled ?? true;

    return {
      channels: subscriberGlobalChannels,
      enabled,
    };
  }

  @CachedEntity({
    builder: (command: { subscriberId: string; _environmentId: string }) =>
      buildSubscriberKey({
        _environmentId: command._environmentId,
        subscriberId: command.subscriberId,
      }),
  })
  private async getSubscriber(
    command: GetSubscriberGlobalPreferenceCommandV1,
  ): Promise<SubscriberEntity | null> {
    const subscriber = await this.subscriberRepository.findBySubscriberId(
      command.environmentId,
      command.subscriberId,
    );

    if (!subscriber) {
      throw new ApiException(`Subscriber ${command.subscriberId} not found`);
    }

    return subscriber;
  }
  // adds default state for missing channels
  private buildDefaultPreferences(preference: IPreferenceChannels) {
    const defaultPreference: IPreferenceChannels = {
      email: true,
      sms: true,
      in_app: true,
      chat: true,
      push: true,
    };

    return { ...defaultPreference, ...preference };
  }
}
