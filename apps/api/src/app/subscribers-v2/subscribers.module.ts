import { Module } from '@nestjs/common';
import {
  NotificationTemplateRepository,
  PreferencesRepository,
  SubscriberRepository,
  TopicSubscribersRepository,
} from '@novu/dal';
import {
  cacheService,
  GetPreferences,
  GetSubscriberGlobalPreference,
  GetSubscriberPreference,
  InvalidateCacheService,
} from '@novu/application-generic';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';
import { PatchSubscriber } from './usecases/patch-subscriber/patch-subscriber.usecase';
import { GetSubscriberPreferences } from './usecases/get-subscriber-preferences/get-subscriber-preferences.usecase';
import { RemoveSubscriber } from './usecases/remove-subscriber/remove-subscriber.usecase';
import { SubscribersController } from './subscribers.controller';

const USE_CASES = [
  ListSubscribersUseCase,
  GetSubscriber,
  PatchSubscriber,
  RemoveSubscriber,
  GetSubscriberPreferences,
  GetSubscriberGlobalPreference,
  GetSubscriberPreference,
  GetPreferences,
];

const DAL_MODELS = [
  SubscriberRepository,
  NotificationTemplateRepository,
  PreferencesRepository,
  TopicSubscribersRepository,
];

@Module({
  controllers: [SubscribersController],
  providers: [...USE_CASES, ...DAL_MODELS, cacheService, InvalidateCacheService],
})
export class SubscribersModule {}
