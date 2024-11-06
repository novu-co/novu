import { BadRequestException, Injectable } from '@nestjs/common';

import {
  ControlValuesEntity,
  NotificationGroupRepository,
  NotificationStepEntity,
  NotificationTemplateEntity,
  PreferencesEntity,
} from '@novu/dal';
import {
  CreateWorkflow as CreateWorkflowGeneric,
  CreateWorkflowCommand,
  GetPreferences,
  GetPreferencesCommand,
  GetPreferencesResponseDto,
  NotificationStep,
  shortId,
  UpdateWorkflow,
  UpdateWorkflowCommand,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
  UpsertPreferences,
  UpsertUserWorkflowPreferencesCommand,
  UpsertWorkflowPreferencesCommand,
} from '@novu/application-generic';
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
  WorkflowPreferences,
  WorkflowResponseDto,
  WorkflowTypeEnum,
} from '@novu/shared';
import { UpsertWorkflowCommand } from './upsert-workflow.command';
import { StepUpsertMechanismFailedMissingIdException } from '../../exceptions/step-upsert-mechanism-failed-missing-id.exception';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';
import { GetWorkflowByIdsUseCase } from '../get-workflow-by-ids/get-workflow-by-ids.usecase';
import { GetWorkflowByIdsCommand } from '../get-workflow-by-ids/get-workflow-by-ids.command';
import { stepTypeToDefaultDashboardControlSchema } from '../../shared';

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
    private upsertPreferencesUsecase: UpsertPreferences,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private getPreferencesUseCase: GetPreferences
  ) {}
  async execute(command: UpsertWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowForUpdate = await this.queryWorkflow(command);
    const workflow = await this.createOrUpdateWorkflow(workflowForUpdate, command);
    await this.upsertControlValues(workflow, command);
    const preferences = await this.upsertPreference(command, workflow);

    return toResponseWorkflowDto(workflow, preferences);
  }

  private async queryWorkflow(command: UpsertWorkflowCommand): Promise<NotificationTemplateEntity | null> {
    if (!command.identifierOrInternalId) {
      return null;
    }

    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        ...command,
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

  private async upsertPreference(
    command: UpsertWorkflowCommand,
    workflow: NotificationTemplateEntity
  ): Promise<GetPreferencesResponseDto | undefined> {
    await this.upsertUserWorkflowPreferences(workflow, command);
    await this.upsertWorkflowPreferences(workflow, command);

    return await this.getPersistedPreferences(workflow);
  }

  private async getPersistedPreferences(workflow: NotificationTemplateEntity) {
    return await this.getPreferencesUseCase.safeExecute(
      GetPreferencesCommand.create({
        environmentId: workflow._environmentId,
        organizationId: workflow._organizationId,
        templateId: workflow._id,
      })
    );
  }

  private async upsertUserWorkflowPreferences(
    workflow: NotificationTemplateEntity,
    command: UpsertWorkflowCommand
  ): Promise<PreferencesEntity> {
    let preferences: WorkflowPreferences | null;
    if (command.workflowDto.preferences?.user !== undefined) {
      preferences = command.workflowDto.preferences.user;
    } else {
      preferences = DEFAULT_WORKFLOW_PREFERENCES;
    }

    return await this.upsertPreferencesUsecase.upsertUserWorkflowPreferences(
      UpsertUserWorkflowPreferencesCommand.create({
        environmentId: workflow._environmentId,
        organizationId: workflow._organizationId,
        userId: command.user._id,
        templateId: workflow._id,
        preferences,
      })
    );
  }

  private async upsertWorkflowPreferences(
    workflow: NotificationTemplateEntity,
    command: UpsertWorkflowCommand
  ): Promise<PreferencesEntity> {
    return await this.upsertPreferencesUsecase.upsertWorkflowPreferences(
      UpsertWorkflowPreferencesCommand.create({
        environmentId: workflow._environmentId,
        organizationId: workflow._organizationId,
        templateId: workflow._id,
        preferences: command.workflowDto.preferences?.workflow || null,
      })
    );
  }

  private async createOrUpdateWorkflow(
    existingWorkflow: NotificationTemplateEntity | null,
    command: UpsertWorkflowCommand
  ): Promise<NotificationTemplateEntity> {
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
      critical: false,
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
