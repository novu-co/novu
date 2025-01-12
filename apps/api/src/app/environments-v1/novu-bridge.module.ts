import { Module } from '@nestjs/common';
import { NovuClient, NovuHandler } from '@novu/framework/nest';

import { GetDecryptedSecretKey } from '@novu/application-generic';
import { EnvironmentRepository, NotificationTemplateRepository } from '@novu/dal';
import { NovuBridgeClient } from './novu-bridge-client';
import { NovuBridgeController } from './novu-bridge.controller';
import { ConstructFrameworkWorkflow } from './usecases/construct-framework-workflow';
import {
  ChatOutputRendererUsecase,
  EmailOutputRendererUsecase,
  ExpandEmailEditorSchemaUsecase,
  HydrateEmailSchemaUseCase,
  InAppOutputRendererUsecase,
  PushOutputRendererUsecase,
  SmsOutputRendererUsecase,
} from './usecases/output-renderers';
import { DelayOutputRendererUsecase } from './usecases/output-renderers/delay-output-renderer.usecase';
import { DigestOutputRendererUsecase } from './usecases/output-renderers/digest-output-renderer.usecase';
import { ThrottleOutputRendererUsecase } from './usecases/output-renderers/throttle-output-renderer.usecase';

@Module({
  controllers: [NovuBridgeController],
  providers: [
    {
      provide: NovuClient,
      useClass: NovuBridgeClient,
    },
    NovuHandler,
    EnvironmentRepository,
    NotificationTemplateRepository,
    ConstructFrameworkWorkflow,
    GetDecryptedSecretKey,
    InAppOutputRendererUsecase,
    EmailOutputRendererUsecase,
    SmsOutputRendererUsecase,
    ChatOutputRendererUsecase,
    PushOutputRendererUsecase,
    EmailOutputRendererUsecase,
    ExpandEmailEditorSchemaUsecase,
    HydrateEmailSchemaUseCase,
    DelayOutputRendererUsecase,
    DigestOutputRendererUsecase,
    ThrottleOutputRendererUsecase,
  ],
})
export class NovuBridgeModule {}
