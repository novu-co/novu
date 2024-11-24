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
} from '@novu/application-generic';
import { PreferencesRepository } from '@novu/dal';
import { SharedModule } from '../shared/shared.module';
import { BridgeController } from './bridge.controller';
import { USECASES } from './usecases';
import { UpsertWorkflowUseCase } from '../workflows-v2/usecases/upsert-workflow/upsert-workflow.usecase';
import { PostProcessWorkflowUpdate } from '../workflows-v2/usecases/post-process-workflow-update';
import { PatchStepUsecase } from '../workflows-v2/usecases/patch-step-data';
import { OverloadContentDataOnWorkflowUseCase } from '../workflows-v2/usecases/overload-content-data';
import { BuildStepDataUsecase } from '../workflows-v2/usecases/build-step-data';
import {
  BuildDefaultPayloadUsecase,
  CollectPlaceholderWithDefaultsUsecase,
  PrepareAndValidateContentUsecase,
  ValidatePlaceholderUsecase,
} from '../workflows-v2/usecases/validate-content';
import { BuildAvailableVariableSchemaUsecase } from '../workflows-v2/usecases/build-variable-schema';
import { ExtractDefaultValuesFromSchemaUsecase } from '../workflows-v2/usecases/extract-default-values-from-schema';
import { HydrateEmailSchemaUseCase } from '../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';

const SHARED_USECASES = [
  /**
   * TODO: Extract this to a shared workflow module usecase
   */
  UpsertWorkflowUseCase,
  PostProcessWorkflowUpdate,
  PatchStepUsecase,
  OverloadContentDataOnWorkflowUseCase,
  BuildStepDataUsecase,
  PrepareAndValidateContentUsecase,
  BuildAvailableVariableSchemaUsecase,
  BuildDefaultPayloadUsecase,
  ValidatePlaceholderUsecase,
  CollectPlaceholderWithDefaultsUsecase,
  ExtractDefaultValuesFromSchemaUsecase,
  HydrateEmailSchemaUseCase,
];

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
  ...SHARED_USECASES,
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
