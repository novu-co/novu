import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateWorkflow,
  DeletePreferencesUseCase,
  DeleteWorkflowUseCase,
  GetPreferences,
  GetWorkflowByIdsUseCase,
  TierRestrictionsValidateUsecase,
  UpdateWorkflow,
  UpsertControlValuesUseCase,
  UpsertPreferences,
} from '@novu/application-generic';

import { CommunityOrganizationRepository } from '@novu/dal';
import { AuthModule } from '../auth/auth.module';
import { BridgeModule } from '../bridge';
import { ChangeModule } from '../change/change.module';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers';
import { IntegrationModule } from '../integrations/integrations.module';
import { MessageTemplateModule } from '../message-template/message-template.module';
import { SharedModule } from '../shared/shared.module';
import {
  BuildVariableSchemaUsecase,
  BuildStepDataUsecase,
  BuildWorkflowTestDataUseCase,
  GeneratePreviewUsecase,
  GetWorkflowUseCase,
  ListWorkflowsUseCase,
  SyncToEnvironmentUseCase,
  UpsertWorkflowUseCase,
} from './usecases';
import { PatchWorkflowUsecase } from './usecases/patch-workflow';
import { PatchStepUsecase } from './usecases/patch-step-data/patch-step.usecase';
import { BuildPayloadSchema } from './usecases/build-payload-schema/build-payload-schema.usecase';
import { BuildStepIssuesUsecase } from './usecases/build-step-issues/build-step-issues.usecase';
import { WorkflowController } from './workflow.controller';

const DAL_REPOSITORIES = [CommunityOrganizationRepository];

@Module({
  imports: [SharedModule, MessageTemplateModule, ChangeModule, AuthModule, BridgeModule, IntegrationModule],
  controllers: [WorkflowController],
  providers: [
    ...DAL_REPOSITORIES,
    CreateWorkflow,
    UpdateWorkflow,
    UpsertWorkflowUseCase,
    ListWorkflowsUseCase,
    DeleteWorkflowUseCase,
    UpsertPreferences,
    DeletePreferencesUseCase,
    UpsertControlValuesUseCase,
    GetPreferences,
    GetWorkflowByIdsUseCase,
    SyncToEnvironmentUseCase,
    BuildStepDataUsecase,
    GeneratePreviewUsecase,
    BuildWorkflowTestDataUseCase,
    GetWorkflowUseCase,
    HydrateEmailSchemaUseCase,
    BuildVariableSchemaUsecase,
    PatchStepUsecase,
    PatchWorkflowUsecase,
    TierRestrictionsValidateUsecase,
    BuildPayloadSchema,
    BuildStepIssuesUsecase,
  ],
})
export class WorkflowModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {}
}
