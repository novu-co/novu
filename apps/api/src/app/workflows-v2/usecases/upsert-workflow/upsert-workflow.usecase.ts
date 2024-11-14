import {
  ControlValuesEntity,
  NotificationGroupRepository,
  NotificationStepEntity,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';
import {
  CreateWorkflowDto,
  DEFAULT_WORKFLOW_PREFERENCES,
  IdentifierOrInternalId,
  slugify,
  StepCreateDto,
  StepDto,
  StepUpdateDto,
  UpdateWorkflowDto,
  UserSessionData,
  WorkflowCreationSourceEnum,
  WorkflowOriginEnum,
  WorkflowResponseDto,
  WorkflowTypeEnum,
} from '@novu/shared';
import {
  CreateWorkflow as CreateWorkflowGeneric,
  CreateWorkflowCommand,
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  GetWorkflowByIdsResponseDto,
  NotificationStep,
  shortId,
  UpdateWorkflow,
  UpdateWorkflowCommand,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
} from '@novu/application-generic';
import { BadRequestException, Injectable } from '@nestjs/common';
import _ = require('lodash');
import { UpsertWorkflowCommand } from './upsert-workflow.command';
import { PrepareAndValidateContentUsecase, ValidatedContentResponse } from '../validate-content';
import { BuildAvailableVariableSchemaUsecase } from '../build-variable-schema';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';
import { StepUpsertMechanismFailedMissingIdException } from '../../exceptions/step-upsert-mechanism-failed-missing-id.exception';
import { stepTypeToDefaultDashboardControlSchema } from '../../shared';
import { StepMissingControlsException } from '../../exceptions/step-not-found-exception';
import { ProcessWorkflowIssuesUsecase } from '../process-workflow-issues';

function buildUpsertControlValuesCommand(
  command: UpsertWorkflowCommand,
  persistedStep: NotificationStepEntity,
  persistedWorkflow: NotificationTemplateEntity,
  stepInDto: StepUpdateDto | StepCreateDto
): UpsertControlValuesCommand {
  return UpsertControlValuesCommand.create({
    organizationId: command.user.organizationId,
    environmentId: command.user.environmentId,
    notificationStepEntity: persistedStep,
    workflowId: persistedWorkflow._id,
    newControlValues: stepInDto.controlValues || {},
  });
}

@Injectable()
export class UpsertWorkflowUseCase {
  constructor(
    private createWorkflowGenericUsecase: CreateWorkflowGeneric,
    private updateWorkflowUsecase: UpdateWorkflow,
    private notificationGroupRepository: NotificationGroupRepository,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    private processWorkflowIssuesUsecase: ProcessWorkflowIssuesUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase,
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase,
    private notificationTemplateRepository: NotificationTemplateRepository
  ) {}
  async execute(command: UpsertWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowForUpdate = await this.queryWorkflow(command);
    const workflow = await this.createOrUpdateWorkflow(workflowForUpdate, command);
    const stepIdToControlValuesMap = await this.upsertControlValues(workflow, command);
    const validatedContentsArray = await this.validateStepContent(workflow, stepIdToControlValuesMap);
    await this.overloadPayloadSchemaOnWorkflow(workflow, validatedContentsArray);
    const validatedWorkflowWithIssues = await this.processWorkflowIssuesUsecase.execute({
      user: command.user,
      workflow,
      stepIdToControlValuesMap,
      validatedContentsArray,
    });
    await this.persistWorkflow(validatedWorkflowWithIssues, command);
    const persistedWorkflow = await this.getWorkflow(command, validatedWorkflowWithIssues._id);

    return toResponseWorkflowDto(persistedWorkflow);
  }
  private async getWorkflow(command: UpsertWorkflowCommand, workflowId: string) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: workflowId,
      })
    );
  }

  private async persistWorkflow(workflowWithIssues: NotificationTemplateEntity, command: UpsertWorkflowCommand) {
    await this.notificationTemplateRepository.update(
      {
        _id: workflowWithIssues._id,
        _environmentId: command.user.environmentId,
      },
      {
        ...workflowWithIssues,
      }
    );
  }

  async overloadPayloadSchemaOnWorkflow(
    workflow: NotificationTemplateEntity,
    stepIdToControlValuesMap: { [p: string]: ValidatedContentResponse }
  ) {
    let finalPayload = {};
    for (const value of Object.values(stepIdToControlValuesMap)) {
      finalPayload = _.merge(finalPayload, value.finalPayload.payload);
    }
    // eslint-disable-next-line no-param-reassign
    workflow.payloadSchema = JSON.stringify(convertJsonToSchemaWithDefaults(finalPayload));
  }

  private async queryWorkflow(command: UpsertWorkflowCommand): Promise<GetWorkflowByIdsResponseDto | null> {
    if (!command.identifierOrInternalId) {
      return null;
    }

    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  private async upsertControlValues(workflow: NotificationTemplateEntity, command: UpsertWorkflowCommand) {
    const stepIdToControlValuesMap: { [p: string]: ControlValuesEntity } = {};
    for (const persistedStep of workflow.steps) {
      const controlValuesEntity = await this.upsertControlValuesForSingleStep(persistedStep, command, workflow);
      if (controlValuesEntity) {
        stepIdToControlValuesMap[persistedStep._templateId] = controlValuesEntity;
      }
    }

    return stepIdToControlValuesMap;
  }

  private async upsertControlValuesForSingleStep(
    persistedStep: NotificationStepEntity,
    command: UpsertWorkflowCommand,
    persistedWorkflow: NotificationTemplateEntity
  ): Promise<ControlValuesEntity | undefined> {
    const stepDatabaseId = persistedStep._templateId;
    const stepExternalId = persistedStep.name;
    if (!stepDatabaseId && !stepExternalId) {
      throw new StepUpsertMechanismFailedMissingIdException(stepDatabaseId, stepExternalId, persistedStep);
    }
    const stepInDto = command.workflowDto?.steps.find((commandStepItem) => commandStepItem.name === persistedStep.name);
    if (!stepInDto) {
      // TODO: should delete the values from the database?  or just ignore?
      return;
    }

    const upsertControlValuesCommand = buildUpsertControlValuesCommand(
      command,
      persistedStep,
      persistedWorkflow,
      stepInDto
    );

    return await this.upsertControlValuesUseCase.execute(upsertControlValuesCommand);
  }

  private async createOrUpdateWorkflow(
    existingWorkflow: NotificationTemplateEntity | null,
    command: UpsertWorkflowCommand
  ): Promise<GetWorkflowByIdsResponseDto> {
    if (existingWorkflow && isWorkflowUpdateDto(command.workflowDto, command.identifierOrInternalId)) {
      return await this.updateWorkflowUsecase.execute(
        UpdateWorkflowCommand.create(
          this.convertCreateToUpdateCommand(command.workflowDto, command.user, existingWorkflow)
        )
      );
    }

    return await this.createWorkflowGenericUsecase.execute(
      CreateWorkflowCommand.create(await this.buildCreateWorkflowGenericCommand(command))
    );
  }

  private async buildCreateWorkflowGenericCommand(command: UpsertWorkflowCommand): Promise<CreateWorkflowCommand> {
    const { user } = command;
    // It's safe to assume we're dealing with CreateWorkflowDto on the creation path
    const workflowDto = command.workflowDto as CreateWorkflowDto;
    const isWorkflowActive = workflowDto?.active ?? true;
    const notificationGroupId = await this.getNotificationGroup(command.user.environmentId);

    if (!notificationGroupId) {
      throw new BadRequestException('Notification group not found');
    }

    return {
      notificationGroupId,
      environmentId: user.environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      __source: workflowDto.__source || WorkflowCreationSourceEnum.DASHBOARD,
      type: WorkflowTypeEnum.BRIDGE,
      origin: WorkflowOriginEnum.NOVU_CLOUD,
      steps: this.mapSteps(workflowDto.steps),
      payloadSchema: {},
      active: isWorkflowActive,
      description: workflowDto.description || '',
      tags: workflowDto.tags || [],
      userPreferences: command.workflowDto.preferences?.user ?? null,
      defaultPreferences: command.workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      triggerIdentifier: slugify(workflowDto.name),
    };
  }

  private convertCreateToUpdateCommand(
    workflowDto: UpdateWorkflowDto,
    user: UserSessionData,
    existingWorkflow: NotificationTemplateEntity
  ): UpdateWorkflowCommand {
    return {
      id: existingWorkflow._id,
      environmentId: existingWorkflow._environmentId,
      organizationId: user.organizationId,
      userId: user._id,
      name: workflowDto.name,
      steps: this.mapSteps(workflowDto.steps, existingWorkflow),
      rawData: workflowDto,
      type: WorkflowTypeEnum.BRIDGE,
      description: workflowDto.description,
      userPreferences: workflowDto.preferences?.user ?? null,
      defaultPreferences: workflowDto.preferences?.workflow ?? DEFAULT_WORKFLOW_PREFERENCES,
      tags: workflowDto.tags,
      active: workflowDto.active ?? true,
    };
  }
  private mapSteps(
    commandWorkflowSteps: Array<StepCreateDto | StepUpdateDto>,
    persistedWorkflow?: NotificationTemplateEntity | undefined
  ): NotificationStep[] {
    const steps: NotificationStep[] = [];

    for (const step of commandWorkflowSteps) {
      const mappedStep = this.mapSingleStep(persistedWorkflow, step);
      const baseStepId = mappedStep.stepId;

      if (baseStepId) {
        const previousStepIds = steps.map((stepX) => stepX.stepId).filter((id) => id != null);
        mappedStep.stepId = this.generateUniqueStepId(baseStepId, previousStepIds);
      }

      steps.push(mappedStep);
    }

    return steps;
  }

  private generateUniqueStepId(baseStepId: string, previousStepIds: string[]): string {
    let currentStepId = baseStepId;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      if (isUniqueStepId(currentStepId, previousStepIds)) {
        break;
      }
      currentStepId = `${baseStepId}-${shortId()}`;
      attempts += 1;
    }

    if (attempts === maxAttempts && !isUniqueStepId(currentStepId, previousStepIds)) {
      throw new BadRequestException({
        message: 'Failed to generate unique stepId',
        stepId: baseStepId,
      });
    }

    return currentStepId;
  }

  private mapSingleStep(
    persistedWorkflow: NotificationTemplateEntity | undefined,
    step: StepUpdateDto | StepCreateDto
  ): NotificationStep {
    const foundPersistedStep = this.getPersistedStepIfFound(persistedWorkflow, step);
    const stepEntityToReturn = this.buildBaseStepEntity(step, foundPersistedStep);
    if (foundPersistedStep) {
      return {
        ...stepEntityToReturn,
        _id: foundPersistedStep._templateId,
        _templateId: foundPersistedStep._templateId,
        template: { ...stepEntityToReturn.template, _id: foundPersistedStep._templateId },
      };
    }

    return stepEntityToReturn;
  }

  private buildBaseStepEntity(
    step: StepDto | StepUpdateDto,
    foundPersistedStep?: NotificationStepEntity
  ): NotificationStep {
    return {
      template: {
        type: step.type,
        name: step.name,
        controls: foundPersistedStep?.template?.controls || stepTypeToDefaultDashboardControlSchema[step.type],
        content: '',
      },
      stepId: foundPersistedStep?.stepId || slugify(step.name),
      name: step.name,
    };
  }

  private getPersistedStepIfFound(
    persistedWorkflow: NotificationTemplateEntity | undefined,
    stepUpdateRequest: StepUpdateDto | StepCreateDto
  ) {
    if (!persistedWorkflow?.steps) {
      return;
    }

    for (const persistedStep of persistedWorkflow.steps) {
      if (this.isStepUpdateDto(stepUpdateRequest) && persistedStep._templateId === stepUpdateRequest._id) {
        return persistedStep;
      }
    }
  }

  private isStepUpdateDto(obj: StepUpdateDto | StepCreateDto): obj is StepUpdateDto {
    return typeof obj === 'object' && obj !== null && !!(obj as StepUpdateDto)._id;
  }

  private async getNotificationGroup(environmentId: string): Promise<string | undefined> {
    return (
      await this.notificationGroupRepository.findOne(
        {
          name: 'General',
          _environmentId: environmentId,
        },
        '_id'
      )
    )?._id;
  }

  private async validateStepContent(
    workflow: NotificationTemplateEntity,
    stepIdToControlValuesMap: Record<string, ControlValuesEntity>
  ) {
    const validatedStepContent: Record<string, ValidatedContentResponse> = {};

    for (const step of workflow.steps) {
      const controls = step.template?.controls;
      if (!controls) {
        throw new StepMissingControlsException(step._templateId, step);
      }
      const controlValues = stepIdToControlValuesMap[step._templateId];
      const jsonSchemaDto = this.buildAvailableVariableSchemaUsecase.execute({
        workflow,
        stepDatabaseId: step._templateId,
      });
      validatedStepContent[step._templateId] = await this.prepareAndValidateContentUsecase.execute({
        controlDataSchema: controls.schema,
        controlValues: controlValues?.controls || {},
        variableSchema: jsonSchemaDto,
      });
    }

    return validatedStepContent;
  }
}

function isWorkflowUpdateDto(
  workflowDto: CreateWorkflowDto | UpdateWorkflowDto,
  id?: IdentifierOrInternalId
): workflowDto is UpdateWorkflowDto {
  return !!id;
}

const isUniqueStepId = (stepIdToValidate: string, otherStepsIds: string[]) => {
  return !otherStepsIds.some((stepId) => stepId === stepIdToValidate);
};
