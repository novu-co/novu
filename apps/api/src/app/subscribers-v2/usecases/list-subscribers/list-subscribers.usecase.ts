import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { SubscriberRepository } from '@novu/dal';
import { IListSubscribersResponseDto } from '@novu/shared';
import { ListSubscribersCommand } from './list-subscribers.command';

@Injectable()
export class ListSubscribersUseCase {
  constructor(private subscriberRepository: SubscriberRepository) {}

  @InstrumentUsecase()
  async execute(command: ListSubscribersCommand): Promise<IListSubscribersResponseDto> {
    const pagination = await this.subscriberRepository.listSubscribers({
      after: command.after,
      before: command.before,
      limit: command.limit,
      sortDirection: command.orderDirection,
      sortBy: command.orderBy,
      email: command.email,
      name: command.name,
      phone: command.phone,
      subscriberId: command.subscriberId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
    });

    return {
      subscribers: pagination.subscribers.map((subscriber) => ({
        _id: subscriber._id,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        email: subscriber.email,
        phone: subscriber.phone,
        subscriberId: subscriber.subscriberId,
        createdAt: subscriber.createdAt,
        updatedAt: subscriber.updatedAt,
        _environmentId: subscriber._environmentId,
        _organizationId: subscriber._organizationId,
        deleted: subscriber.deleted,
      })),
      next: pagination.next,
      previous: pagination.previous,
    };
  }
}
