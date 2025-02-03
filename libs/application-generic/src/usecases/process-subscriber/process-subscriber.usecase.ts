import { Injectable } from '@nestjs/common';
import { SubscriberEntity, SubscriberRepository } from '@novu/dal';

import { ISubscribersDefine } from '@novu/shared';
import {
  CreateAndUpdateSubscriberUseCase,
  CreateOrUpdateSubscriberCommand,
} from '../create-subscriber';
import { InstrumentUsecase } from '../../instrumentation';
import { ProcessSubscriberCommand } from './process-subscriber.command';
import { buildDedupSubscriberKey, CacheService } from '../../services/cache';

@Injectable()
export class ProcessSubscriber {
  private localCache: Set<string> = new Set();
  private retryCount = 0;
  constructor(
    private createOrUpdateSubscriberUsecase: CreateAndUpdateSubscriberUseCase,
    private subscriberRepository: SubscriberRepository,
    private cacheService: CacheService,
  ) {}

  @InstrumentUsecase()
  public async execute(
    command: ProcessSubscriberCommand,
  ): Promise<SubscriberEntity | undefined> {
    const subscriberEntity = await this.subscriberRepository.findBySubscriberId(
      command.environmentId,
      command.subscriber.subscriberId,
      false,
    );

    return await this.createOrUpdateSubscriber(command, subscriberEntity);
  }

  private async createOrUpdateSubscriber(
    command: ProcessSubscriberCommand,
    existingSubscriber?: SubscriberEntity,
  ): Promise<SubscriberEntity> {
    if (!existingSubscriber) {
      if (await this.isCreateInProcess(command)) {
        return await this.retryIfNotExceeded(command);
      }
    }

    return await this.callCreateOrUpdateUsecase(
      command.environmentId,
      command.organizationId,
      command.subscriber,
      existingSubscriber,
    );
  }

  private async isCreateInProcess(command: ProcessSubscriberCommand) {
    const cacheKey = buildDedupSubscriberKey({
      subscriberId: command.subscriber.subscriberId,
      _environmentId: command.environmentId,
    });

    let isCached = this.localCache.has(cacheKey);
    if (isCached) {
      return true;
    }
    this.localCache.add(cacheKey);
    isCached = !!(await this.cacheService.get(cacheKey));
    if (isCached) {
      return true;
    }
    await this.cacheService.set(cacheKey, 'true', { ttl: 100 });

    return false;
  }

  private async retryIfNotExceeded(command: ProcessSubscriberCommand) {
    if (this.retryCount > 1) {
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    this.retryCount += 1;

    return this.execute(command);
  }

  private async callCreateOrUpdateUsecase(
    environmentId: string,
    organizationId: string,
    subscriberPayload: ISubscribersDefine,
    existingSubscriber,
  ) {
    return await this.createOrUpdateSubscriberUsecase.execute(
      this.buildCommand(
        environmentId,
        organizationId,
        subscriberPayload,
        existingSubscriber,
      ),
    );
  }

  private buildCommand(
    environmentId: string,
    organizationId: string,
    subscriberPayload: ISubscribersDefine,
    existingSubscriber,
  ) {
    return CreateOrUpdateSubscriberCommand.create({
      environmentId,
      organizationId,
      subscriberId: subscriberPayload?.subscriberId,
      email: subscriberPayload?.email,
      firstName: subscriberPayload?.firstName,
      lastName: subscriberPayload?.lastName,
      phone: subscriberPayload?.phone,
      avatar: subscriberPayload?.avatar,
      locale: subscriberPayload?.locale,
      subscriber: existingSubscriber || undefined,
      data: subscriberPayload?.data,
      channels: subscriberPayload?.channels,
    });
  }
}
