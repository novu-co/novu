import { Module } from '@nestjs/common';
import { NotificationTemplateRepository, PreferencesRepository, SubscriberRepository } from '@novu/dal';
import {
  cacheService,
  GetPreferences,
  GetSubscriberGlobalPreference,
  GetSubscriberPreference,
} from '@novu/application-generic';
import { SubscriberController } from './subscriber.controller';
import { ListSubscribersUseCase } from './usecases/list-subscribers/list-subscribers.usecase';
import { GetSubscriber } from './usecases/get-subscriber/get-subscriber.usecase';
import { PatchSubscriber } from './usecases/patch-subscriber/patch-subscriber.usecase';
import { GetSubscriberPreferences } from './usecases/get-subscriber-preferences/get-subscriber-preferences.usecase';
import { RemoveSubscriber } from './usecases/remove-subscriber/remove-subscriber.usecase';

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

const DAL_MODELS = [SubscriberRepository, NotificationTemplateRepository, PreferencesRepository];

@Module({
  controllers: [SubscriberController],
  providers: [...USE_CASES, ...DAL_MODELS, cacheService],
})
export class SubscribersModule {}
