import {
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
  GetPreferences,
  GetPreferencesCommand,
  GetPreferencesResponseDto,
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  NotificationStep,
  shortId,
  UpdateWorkflow,
  UpdateWorkflowCommand,
  UpsertPreferences,
  UpsertUserWorkflowPreferencesCommand,
  UpsertWorkflowPreferencesCommand,
} from '@novu/application-generic';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpsertWorkflowCommand } from './upsert-workflow.command';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';
import { stepTypeToDefaultDashboardControlSchema } from '../../shared';
import { WorkflowNotFoundException } from '../../exceptions/workflow-not-found-exception';
import { PatchStepUsecase } from '../patch-step-data';
import { PostProcessWorkflowUpdate } from '../post-process-workflow-update';

@Injectable()
export class UpsertWorkflowUseCase {
  constructor(
    private createWorkflowGenericUsecase: CreateWorkflowGeneric,
    private updateWorkflowUsecase: UpdateWorkflow,
    private notificationGroupRepository: NotificationGroupRepository,
    private upsertPreferencesUsecase: UpsertPreferences,
    private workflowUpdatePostProcess: PostProcessWorkflowUpdate,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private getPreferencesUseCase: GetPreferences,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private patchStepDataUsecase: PatchStepUsecase
  ) {}
  async execute(command: UpsertWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowForUpdate = await this.queryWorkflow(command);
    let persistedWorkflow = await this.createOrUpdateWorkflow(workflowForUpdate, command);
    persistedWorkflow = await this.upsertControlValues(persistedWorkflow, command);
    const preferences = await this.upsertPreference(command, persistedWorkflow);
    const validatedWorkflowWithIssues = await this.workflowUpdatePostProcess.execute({
      user: command.user,
      workflow: persistedWorkflow,
    });
    await this.persistWorkflow(validatedWorkflowWithIssues, command);
    persistedWorkflow = await this.getWorkflow(validatedWorkflowWithIssues._id, command.user.environmentId);

    return toResponseWorkflowDto(persistedWorkflow, preferences);
  }
  private async getWorkflow(workflowId: string, environmentId: string): Promise<NotificationTemplateEntity> {
    const entity = await this.notificationTemplateRepository.findById(workflowId, environmentId);
    if (!entity) {
      throw new WorkflowNotFoundException(workflowId);
    }

    return entity;
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

  private async queryWorkflow(command: UpsertWorkflowCommand): Promise<NotificationTemplateEntity | null> {
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

  private async upsertUserWorkflowPreferences(workflow: NotificationTemplateEntity, command: UpsertWorkflowCommand) {
    const preferences = this.buildPreferenceObject(command);

    await this.upsertPreferencesUsecase.upsertUserWorkflowPreferences(
      UpsertUserWorkflowPreferencesCommand.create({
        environmentId: workflow._environmentId,
        organizationId: workflow._organizationId,
        userId: command.user._id,
        templateId: workflow._id,
        preferences,
      })
    );
  }

  private buildPreferenceObject(command: UpsertWorkflowCommand) {
    if (command.workflowDto.preferences?.user === undefined) {
      return DEFAULT_WORKFLOW_PREFERENCES; // If missing put defaults
    }
    if (command.workflowDto.preferences?.user === null) {
      // That's the way the FE signals that the user has decided no overrides.
      return null;
    }

    return command.workflowDto.preferences.user;
  }

  private async upsertWorkflowPreferences(workflow: NotificationTemplateEntity, command: UpsertWorkflowCommand) {
    if (!command.workflowDto.preferences?.workflow) {
      return;
    }

    await this.upsertPreferencesUsecase.upsertWorkflowPreferences(
      UpsertWorkflowPreferencesCommand.create({
        environmentId: workflow._environmentId,
        organizationId: workflow._organizationId,
        templateId: workflow._id,
        preferences: command.workflowDto.preferences.workflow,
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
  /**
   * @deprecated This method will be removed in future versions.
   * Please use `the patch step data instead, do not add here anything` instead.
   */
  private async upsertControlValues(
    workflow: NotificationTemplateEntity,
    command: UpsertWorkflowCommand
  ): Promise<NotificationTemplateEntity> {
    for (const step of workflow.steps) {
      const controlValues = this.findControlValueInRequest(step, command.workflowDto.steps);
      if (!controlValues) {
        continue;
      }
      await this.patchStepDataUsecase.execute({
        controlValues,
        identifierOrInternalId: workflow._id,
        name: step.name,
        stepId: step._templateId,
        user: command.user,
      });
    }

    return await this.getWorkflow(workflow._id, command.user.environmentId);
  }

  private findControlValueInRequest(
    step: NotificationStepEntity,
    steps: (StepCreateDto | StepUpdateDto)[] | StepCreateDto[]
  ): Record<string, unknown> | undefined {
    return steps.find((stepRequest) => {
      if (this.isStepUpdateDto(stepRequest)) {
        return stepRequest._id === step._templateId;
      }

      return stepRequest.name === step.name;
    })?.controlValues;
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
