import { Module } from '@nestjs/common';
import { SubscriberRepository } from '@novu/dal';
import { SubscriberController } from './subscriber.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';
import { PatchSubscriber } from './usecases/patch-subscriber/patch-subscriber.usecase';
import { RemoveSubscriber } from './usecases/remove-subscriber/remove-subscriber.usecase';
import { SharedModule } from '../shared/shared.module';
import { PreferencesModule } from '../preferences/preferences.module';

const USE_CASES = [ListSubscribersUseCase, GetSubscriber, PatchSubscriber, RemoveSubscriber];

@Module({
  imports: [SharedModule, PreferencesModule],
  controllers: [SubscriberController],
  providers: [...USE_CASES, SubscriberRepository],
})
export class SubscriberModule {}
