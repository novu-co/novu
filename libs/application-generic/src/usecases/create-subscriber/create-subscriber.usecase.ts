import { Injectable } from '@nestjs/common';
import {
  ErrorCodesEnum,
  SubscriberEntity,
  SubscriberRepository,
} from '@novu/dal';

import { AnalyticsService } from '../../services/analytics.service';
import {
  buildSubscriberKey,
  CachedEntity,
  InvalidateCacheService,
} from '../../services/cache';
import {
  OAuthHandlerEnum,
  UpdateSubscriberChannel,
  UpdateSubscriberChannelCommand,
} from '../subscribers';
import {
  UpdateSubscriber,
  UpdateSubscriberCommand,
} from '../update-subscriber';
import { CreateSubscriberCommand } from './create-subscriber.command';

@Injectable()
export class CreateSubscriber {
  constructor(
    private invalidateCache: InvalidateCacheService,
    private subscriberRepository: SubscriberRepository,
    private updateSubscriber: UpdateSubscriber,
    private updateSubscriberChannel: UpdateSubscriberChannel,
    private analyticsService: AnalyticsService,
  ) {}

  async execute(command: CreateSubscriberCommand) {
    let subscriber =
      command.subscriber ??
      (await this.fetchSubscriber({
        _environmentId: command.environmentId,
        subscriberId: command.subscriberId,
      }));

    if (!subscriber) {
      subscriber = await this.createSubscriber(command);

      this.analyticsService.mixpanelTrack('Subscriber Created', '', {
        _organization: command.organizationId,
        hasEmail: !!command.email,
        hasPhone: !!command.phone,
        hasAvatar: !!command.avatar,
        hasLocale: !!command.locale,
        hasData: !!command.data,
        hasCredentials: !!command.channels,
      });

      if (command.channels?.length) {
        await this.updateCredentials(command);
        // fetch subscriber again as channel credentials are updated
        subscriber = await this.fetchSubscriber({
          _environmentId: command.environmentId,
          subscriberId: command.subscriberId,
        });
      }
    } else {
      subscriber = await this.updateSubscriber.execute(
        UpdateSubscriberCommand.create({
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          firstName: command.firstName,
          lastName: command.lastName,
          subscriberId: command.subscriberId,
          email: command.email,
          phone: command.phone,
          avatar: command.avatar,
          locale: command.locale,
          data: command.data,
          subscriber,
          channels: command.channels,
        }),
      );
    }

    return subscriber;
  }

  private async updateCredentials(command: CreateSubscriberCommand) {
    for (const channel of command.channels) {
      await this.updateSubscriberChannel.execute(
        UpdateSubscriberChannelCommand.create({
          organizationId: command.organizationId,
          environmentId: command.environmentId,
          subscriberId: command.subscriberId,
          providerId: channel.providerId,
          credentials: channel.credentials,
          integrationIdentifier: channel.integrationIdentifier,
          oauthHandler: OAuthHandlerEnum.EXTERNAL,
          isIdempotentOperation: false,
        }),
      );
    }
  }

  private async createSubscriber(command: CreateSubscriberCommand) {
    try {
      await this.invalidateCache.invalidateByKey({
        key: buildSubscriberKey({
          subscriberId: command.subscriberId,
          _environmentId: command.environmentId,
        }),
      });

      const subscriberPayload = {
        _environmentId: command.environmentId,
        _organizationId: command.organizationId,
        firstName: command.firstName,
        lastName: command.lastName,
        subscriberId: command.subscriberId,
        email: command.email,
        phone: command.phone,
        avatar: command.avatar,
        locale: command.locale,
        data: command.data,
      };

      return await this.subscriberRepository.create(subscriberPayload);
    } catch (err: any) {
      /*
       * Possible race condition on subscriber creation, try fetch newly created the subscriber
       */
      if (err.code === ErrorCodesEnum.DUPLICATE_KEY) {
        return await this.fetchSubscriber({
          _environmentId: command.environmentId,
          subscriberId: command.subscriberId,
        });
      } else {
        throw err;
      }
    }
  }

  @CachedEntity({
    builder: (command: { subscriberId: string; _environmentId: string }) =>
      buildSubscriberKey({
        _environmentId: command._environmentId,
        subscriberId: command.subscriberId,
      }),
  })
  private async fetchSubscriber({
    subscriberId,
    _environmentId,
  }: {
    subscriberId: string;
    _environmentId: string;
  }): Promise<SubscriberEntity | null> {
    return await this.subscriberRepository.findBySubscriberId(
      _environmentId,
      subscriberId,
      true,
    );
  }
}
