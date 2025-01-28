import { Module } from '@nestjs/common';
import { SubscriberRepository } from '@novu/dal';
import { SubscribersController } from './subscribers.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';

const USE_CASES = [ListSubscribersUseCase];

@Module({
  controllers: [SubscribersController],
  providers: [...USE_CASES, SubscriberRepository],
})
export class SubscribersModule {}
