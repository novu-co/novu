import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateWorkflow,
  DeleteWorkflowUseCase,
  GetPreferences,
  GetWorkflowByIdsUseCase,
  UpdateWorkflow,
  UpsertControlValuesUseCase,
  UpsertPreferences,
} from '@novu/application-generic';

import { SharedModule } from '../shared/shared.module';
import { MessageTemplateModule } from '../message-template/message-template.module';
import { ChangeModule } from '../change/change.module';
import { AuthModule } from '../auth/auth.module';
import { IntegrationModule } from '../integrations/integrations.module';
import { WorkflowController } from './workflow.controller';
import {
  BuildAvailableVariableSchemaUsecase,
  BuildDefaultPayloadUsecase,
  BuildStepDataUsecase,
  BuildWorkflowTestDataUseCase,
  CollectPlaceholderWithDefaultsUsecase,
  ExtractDefaultValuesFromSchemaUsecase,
  GeneratePreviewUsecase,
  GetWorkflowUseCase,
  ListWorkflowsUseCase,
  PostProcessWorkflowUpdate,
  PrepareAndValidateContentUsecase,
  SyncToEnvironmentUseCase,
  UpsertWorkflowUseCase,
  ValidatePlaceholderUsecase,
} from './usecases';
import { BridgeModule } from '../bridge';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers';
import { PatchStepDataUsecase } from './usecases/patch-step-data';
import { OverloadContentDataOnWorkflowUseCase } from './usecases/overload-content-data';

@Module({
  imports: [SharedModule, MessageTemplateModule, ChangeModule, AuthModule, BridgeModule, IntegrationModule],
  controllers: [WorkflowController],
  providers: [
    CreateWorkflow,
    UpdateWorkflow,
    UpsertWorkflowUseCase,
    ListWorkflowsUseCase,
    DeleteWorkflowUseCase,
    UpsertPreferences,
    UpsertControlValuesUseCase,
    GetPreferences,
    GetWorkflowByIdsUseCase,
    SyncToEnvironmentUseCase,
    BuildStepDataUsecase,
    GeneratePreviewUsecase,
    BuildWorkflowTestDataUseCase,
    GetWorkflowUseCase,
    HydrateEmailSchemaUseCase,
    PostProcessWorkflowUpdate,
    BuildDefaultPayloadUsecase,
    BuildAvailableVariableSchemaUsecase,
    CollectPlaceholderWithDefaultsUsecase,
    PrepareAndValidateContentUsecase,
    ValidatePlaceholderUsecase,
    ExtractDefaultValuesFromSchemaUsecase,
    PatchStepDataUsecase,
    PostProcessWorkflowUpdate,
    OverloadContentDataOnWorkflowUseCase,
  ],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
