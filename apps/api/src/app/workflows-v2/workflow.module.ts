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
  PrepareAndValidateContentUsecase,
  ProcessWorkflowIssuesUsecase,
  SyncToEnvironmentUseCase,
  UpsertWorkflowUseCase,
  ValidatePlaceholderUsecase,
} from './usecases';
import { BridgeModule } from '../bridge';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers';

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
    ProcessWorkflowIssuesUsecase,
    BuildDefaultPayloadUsecase,
    BuildAvailableVariableSchemaUsecase,
    CollectPlaceholderWithDefaultsUsecase,
    PrepareAndValidateContentUsecase,
    ValidatePlaceholderUsecase,
    ExtractDefaultValuesFromSchemaUsecase,
  ],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
