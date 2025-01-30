import { Module } from '@nestjs/common';
import { SubscriberRepository } from '@novu/dal';
import { SubscribersController } from './subscribers.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';
import { PatchSubscriber } from './usecases/patch-subscriber/patch-subscriber.usecase';
import { RemoveSubscriber } from './usecases/remove-subscriber/remove-subscriber.usecase';
import { SharedModule } from '../shared/shared.module';
import { PreferencesModule } from '../preferences/preferences.module';

const USE_CASES = [ListSubscribersUseCase, GetSubscriber, PatchSubscriber, RemoveSubscriber];

@Module({
  controllers: [SubscribersController],
  imports: [SharedModule, PreferencesModule],
  providers: [...USE_CASES, SubscriberRepository],
})
export class SubscribersModule {}
