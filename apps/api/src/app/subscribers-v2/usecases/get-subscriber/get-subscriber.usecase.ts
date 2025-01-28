import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriberEntity, SubscriberRepository } from '@novu/dal';
import { IGetSubscriberResponseDto } from '@novu/shared';
import { GetSubscriberCommand } from './get-subscriber.command';

@Injectable()
export class GetSubscriber {
  constructor(private subscriberRepository: SubscriberRepository) {}

  async execute(command: GetSubscriberCommand): Promise<IGetSubscriberResponseDto> {
    const subscriber = await this.fetchSubscriber({
      _environmentId: command.environmentId,
      subscriberId: command.subscriberId,
      _organizationId: command.organizationId,
    });

    if (!subscriber) {
      throw new NotFoundException(`Subscriber: ${command.subscriberId} was not found`);
    }

    return this.mapSubscriberToDto(subscriber);
  }

  private async fetchSubscriber({
    subscriberId,
    _environmentId,
    _organizationId,
  }: {
    subscriberId: string;
    _environmentId: string;
    _organizationId: string;
  }): Promise<SubscriberEntity | null> {
    return await this.subscriberRepository.findOne({ _environmentId, subscriberId, _organizationId });
  }

  private mapSubscriberToDto(subscriber: SubscriberEntity): IGetSubscriberResponseDto {
    return {
      subscriberId: subscriber.subscriberId,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      email: subscriber.email,
      phone: subscriber.phone,
      avatar: subscriber.avatar,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
      timezone: subscriber.timezone,
      locale: subscriber.locale,
      _organizationId: subscriber._organizationId,
      _environmentId: subscriber._environmentId,
      _id: subscriber._id,
      data: subscriber.data,
    };
  }
}
