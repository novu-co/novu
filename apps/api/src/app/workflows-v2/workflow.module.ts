import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateWorkflow,
  GetPreferences,
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
import { UpsertWorkflowUseCase } from './usecases/upsert-workflow/upsert-workflow.usecase';
import { GetWorkflowUseCase } from './usecases/get-workflow/get-workflow.usecase';
import { ListWorkflowsUseCase } from './usecases/list-workflows/list-workflow.usecase';
import { DeleteWorkflowUseCase } from './usecases/delete-workflow/delete-workflow.usecase';
import { GetWorkflowByIdsUseCase } from './usecases/get-workflow-by-ids/get-workflow-by-ids.usecase';
import { SyncToEnvironmentUseCase } from './usecases/sync-to-environment/sync-to-environment.usecase';
import { BridgeModule } from '../bridge';
import { GeneratePreviewUsecase } from './usecases/generate-preview/generate-preview.usecase';
import { CreateMockPayloadUseCase } from './usecases/placeholder-enrichment/payload-preview-value-generator.usecase';
import { ExtractDefaultsUsecase } from './usecases/get-default-values-from-schema/extract-defaults.usecase';
import { CollectPlaceholdersFromTipTapSchemaUsecase } from './usecases/placeholder-enrichment/collect-placeholders-from-tip-tap-schema.usecase';
import { TransformPlaceholderMapUseCase } from './usecases/placeholder-enrichment/transform-placeholder.usecase';
import { WorkflowTestDataUseCase } from './usecases/test-data/test-data.usecase';
import { GetStepDataUsecase } from './usecases/get-step-schema/get-step-data.usecase';

@Module({
  imports: [SharedModule, MessageTemplateModule, ChangeModule, AuthModule, BridgeModule, IntegrationModule],
  controllers: [WorkflowController],
  providers: [
    CreateWorkflow,
    UpdateWorkflow,
    UpsertWorkflowUseCase,
    GetWorkflowUseCase,
    ListWorkflowsUseCase,
    DeleteWorkflowUseCase,
    UpsertPreferences,
    UpsertControlValuesUseCase,
    GetPreferences,
    GetWorkflowByIdsUseCase,
    SyncToEnvironmentUseCase,
    GetStepDataUsecase,
    GeneratePreviewUsecase,
    GetWorkflowUseCase,
    CreateMockPayloadUseCase,
    ExtractDefaultsUsecase,
    CollectPlaceholdersFromTipTapSchemaUsecase,
    TransformPlaceholderMapUseCase,
    WorkflowTestDataUseCase,
  ],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
