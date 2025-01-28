import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriberEntity, SubscriberRepository } from '@novu/dal';
import { CustomDataType, IGetSubscriberResponseDto } from '@novu/shared';
import { PatchSubscriberCommand } from './patch-subscriber.command';

@Injectable()
export class PatchSubscriber {
  constructor(private subscriberRepository: SubscriberRepository) {}

  async execute(command: PatchSubscriberCommand): Promise<IGetSubscriberResponseDto> {
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

    const updatedSubscriber = await this.subscriberRepository.findOneAndUpdate(
      {
        subscriberId: command.subscriberId,
        _environmentId: command.environmentId,
        _organizationId: command.organizationId,
      },
      { ...payload },
      {
        new: true,
        projection: {
          _environmentId: 1,
          _id: 1,
          _organizationId: 1,
          avatar: 1,
          data: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          locale: 1,
          phone: 1,
          subscriberId: 1,
          timezone: 1,
        },
      }
    );

    if (!updatedSubscriber) {
      throw new NotFoundException(`Subscriber: ${command.subscriberId} was not found`);
    }

    return updatedSubscriber;
  }
}
