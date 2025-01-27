import { Module } from '@nestjs/common';
import { SubscriberRepository } from '@novu/dal';
import { SubscriberController } from './subscriber.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';

const USE_CASES = [ListSubscribersUseCase, GetSubscriber];

@Module({
  controllers: [SubscriberController],
  providers: [...USE_CASES, SubscriberRepository],
})
export class SubscriberModule {}
