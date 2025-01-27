import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriberEntity, SubscriberRepository } from '@novu/dal';
import { CustomDataType, IGetSubscriberResponseDto } from '@novu/shared';
import { GetSubscriberCommand } from '../get-subscriber/get-subscriber.command';
import { GetSubscriber } from '../get-subscriber/get-subscriber.usecase';
import { PatchSubscriberCommand } from './patch-subscriber.command';

@Injectable()
export class PatchSubscriber {
  constructor(
    private subscriberRepository: SubscriberRepository,
    private getSubscriberUsecase: GetSubscriber
  ) {}

  async execute(command: PatchSubscriberCommand): Promise<IGetSubscriberResponseDto> {
    const subscriber = await this.fetchSubscriber({
      subscriberId: command.subscriberId,
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
    });

    if (!subscriber) {
      throw new NotFoundException(`Subscriber: ${command.subscriberId} was not found`);
    }

    const payload: Partial<SubscriberEntity> = {};

    if (command.firstName !== undefined && command.firstName !== null) {
      payload.firstName = command.firstName;
    }

    if (command.lastName !== undefined && command.lastName !== null) {
      payload.lastName = command.lastName;
    }

    if (command.email !== undefined && command.email !== null) {
      payload.email = command.email;
    }

    if (command.phone !== undefined && command.phone !== null) {
      payload.phone = command.phone;
    }

    if (command.avatar !== undefined && command.avatar !== null) {
      payload.avatar = command.avatar;
    }

    if (command.timezone !== undefined && command.timezone !== null) {
      payload.timezone = command.timezone;
    }

    if (command.locale !== undefined && command.locale !== null) {
      payload.locale = command.locale;
    }

    if (command.data !== undefined && command.data !== null) {
      payload.data = command.data as CustomDataType;
    }

    if (Object.keys(payload).length === 0) {
      return subscriber;
    }

    await this.subscriberRepository.update(
      { _id: subscriber._id, _environmentId: command.environmentId, _organizationId: command.organizationId },
      { ...payload }
    );

    return await this.fetchSubscriber({
      subscriberId: command.subscriberId,
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
    });
  }

  private async fetchSubscriber({
    subscriberId,
    _environmentId,
    _organizationId,
  }: {
    subscriberId: string;
    _environmentId: string;
    _organizationId: string;
  }): Promise<IGetSubscriberResponseDto> {
    return await this.getSubscriberUsecase.execute(
      GetSubscriberCommand.create({
        subscriberId,
        environmentId: _environmentId,
        organizationId: _organizationId,
      })
    );
  }
}
