import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import {
  CreateChange,
  CreateMessageTemplate,
  CreateWorkflow,
  DeleteMessageTemplate,
  DeleteWorkflowUseCase,
  GetPreferences,
  GetWorkflowByIdsUseCase,
  UpdateChange,
  UpdateMessageTemplate,
  UpdateWorkflow,
  UpsertControlValuesUseCase,
  UpsertPreferences,
  DeletePreferencesUseCase,
  TierRestrictionsValidateUsecase,
} from '@novu/application-generic';
import { CommunityOrganizationRepository, PreferencesRepository } from '@novu/dal';
import { SharedModule } from '../shared/shared.module';
import { BridgeController } from './bridge.controller';
import { USECASES } from './usecases';
import { BuildVariableSchemaUsecase } from '../workflows-v2/usecases/build-variable-schema';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';
import { BuildPayloadSchema } from '../workflows-v2/usecases/build-payload-schema/build-payload-schema.usecase';
import { BuildStepIssuesUsecase } from '../workflows-v2/usecases/build-step-issues/build-step-issues.usecase';

const PROVIDERS = [
  CreateWorkflow,
  UpdateWorkflow,
  GetWorkflowByIdsUseCase,
  DeleteWorkflowUseCase,
  UpsertControlValuesUseCase,
  CreateMessageTemplate,
  UpdateMessageTemplate,
  DeleteMessageTemplate,
  CreateChange,
  UpdateChange,
  PreferencesRepository,
  GetPreferences,
  UpsertPreferences,
  DeletePreferencesUseCase,
  UpsertControlValuesUseCase,
  BuildVariableSchemaUsecase,
  TierRestrictionsValidateUsecase,
  HydrateEmailSchemaUseCase,
  CommunityOrganizationRepository,
  BuildPayloadSchema,
  BuildStepIssuesUsecase,
];

@Module({
  imports: [SharedModule],
  providers: [...PROVIDERS, ...USECASES],
  controllers: [BridgeController],
  exports: [...USECASES],
})
export class BridgeModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {}
}
