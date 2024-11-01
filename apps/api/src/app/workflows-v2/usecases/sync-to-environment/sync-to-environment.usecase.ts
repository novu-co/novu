import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateWorkflowDto,
  PreferencesTypeEnum,
  StepCreateDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateWorkflowDto,
  WorkflowCreationSourceEnum,
  WorkflowPreferences,
  WorkflowResponseDto,
} from '@novu/shared';
import {
  NotificationStepEntity,
  NotificationTemplateEntity,
  PreferencesEntity,
  PreferencesRepository,
} from '@novu/dal';
import { SyncToEnvironmentCommand } from './sync-to-environment.command';
import { GetWorkflowByIdsUseCase } from '../get-workflow-by-ids/get-workflow-by-ids.usecase';
import { GetWorkflowByIdsCommand } from '../get-workflow-by-ids/get-workflow-by-ids.command';
import { UpsertWorkflowUseCase } from '../upsert-workflow/upsert-workflow.usecase';
import { UpsertWorkflowCommand } from '../upsert-workflow/upsert-workflow.command';

/**
 * This usecase is used to sync a workflow from one environment to another.
 * It will create a new workflow in the target environment if it doesn't exist, or update it if it does.
 * The cloning of the workflow to the target environment includes:
 * - the workflow (NotificationTemplateEntity) + steps
 * - the preferences (PreferencesEntity)
 * - the control values (ControlValuesEntity)
 * - the message template (MessageTemplateEntity)
 */
@Injectable()
export class SyncToEnvironmentUseCase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private preferencesRepository: PreferencesRepository,
    private upsertWorkflowUseCase: UpsertWorkflowUseCase
  ) {}

  async execute(command: SyncToEnvironmentCommand): Promise<WorkflowResponseDto> {
    if (command.user.environmentId === command.targetEnvironmentId) {
      throw new BadRequestException('Cannot sync workflow to the same environment');
    }

    const workflowToClone = await this.getWorkflowToClone(command);
    const preferencesToClone = await this.getWorkflowPreferences(workflowToClone._id, workflowToClone._environmentId);
    const externalId = workflowToClone.triggers[0].identifier;
    const existingWorkflow = await this.findWorkflowInTargetEnvironment(command, externalId);

    const workflowDto = existingWorkflow
      ? await this.mapWorkflowToUpdateWorkflowDto(workflowToClone, existingWorkflow, preferencesToClone)
      : await this.mapWorkflowToCreateWorkflowDto(workflowToClone, preferencesToClone);

    const upsertedWorkflow = await this.upsertWorkflowUseCase.execute(
      UpsertWorkflowCommand.create({
        user: { ...command.user, environmentId: command.targetEnvironmentId },
        identifierOrInternalId: existingWorkflow?._id,
        workflowDto,
      })
    );

    return upsertedWorkflow;
  }

  private async getWorkflowToClone(command: SyncToEnvironmentCommand): Promise<NotificationTemplateEntity> {
    return this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        user: command.user,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  private async findWorkflowInTargetEnvironment(
    command: SyncToEnvironmentCommand,
    externalId: string
  ): Promise<NotificationTemplateEntity | undefined> {
    try {
      return await this.getWorkflowByIdsUseCase.execute(
        GetWorkflowByIdsCommand.create({
          user: { ...command.user, environmentId: command.targetEnvironmentId },
          identifierOrInternalId: externalId,
        })
      );
    } catch (error) {
      return undefined;
    }
  }

  private async mapWorkflowToCreateWorkflowDto(
    workflow: NotificationTemplateEntity,
    preferences: PreferencesEntity[]
  ): Promise<CreateWorkflowDto> {
    return {
      workflowId: workflow.triggers[0].identifier,
      name: workflow.name,
      active: workflow.active,
      tags: workflow.tags,
      description: workflow.description,
      __source: WorkflowCreationSourceEnum.DASHBOARD,
      steps: this.mapStepsToDto(workflow.steps),
      preferences: this.mapPreferences(preferences),
    };
  }

  private async mapWorkflowToUpdateWorkflowDto(
    workflow: NotificationTemplateEntity,
    existingWorkflow: NotificationTemplateEntity,
    preferences: PreferencesEntity[]
  ): Promise<UpdateWorkflowDto> {
    return {
      workflowId: workflow.triggers[0].identifier,
      name: workflow.name,
      active: workflow.active,
      tags: workflow.tags,
      description: workflow.description,
      steps: this.mapStepsToDto(workflow.steps, existingWorkflow.steps),
      preferences: this.mapPreferences(preferences),
    };
  }

  private mapStepsToDto(
    steps: NotificationStepEntity[],
    existingWorkflowSteps?: NotificationStepEntity[]
  ): StepUpdateDto[] | StepCreateDto[] {
    return steps.map((step) => ({
      /*
       * If we are updating an existing workflow, we need to map the updated steps to the existing steps
       * (!) 'existingWorkflowSteps' are from a different environment than 'steps' - the only thing that doesn't change
       *  in steps across environments is the stepId (TODO)
       */
      ...(existingWorkflowSteps && {
        _id:
          existingWorkflowSteps.find((existingStep) => existingStep.stepId === step.stepId)?._templateId ??
          step._templateId,
      }),
      name: step.name ?? '',
      type: step.template?.type ?? StepTypeEnum.TRIGGER,
      controlValues: step.controlVariables ?? {},
    }));
  }

  private mapPreferences(preferences: PreferencesEntity[]): {
    user: WorkflowPreferences | null;
    workflow: WorkflowPreferences | null;
  } {
    // we can typecast the preferences to WorkflowPreferences because user and workflow preferences are always full set
    return {
      user: preferences.find((pref) => pref.type === PreferencesTypeEnum.USER_WORKFLOW)
        ?.preferences as WorkflowPreferences | null,
      workflow: preferences.find((pref) => pref.type === PreferencesTypeEnum.WORKFLOW_RESOURCE)
        ?.preferences as WorkflowPreferences | null,
    };
  }

  private async getWorkflowPreferences(workflowId: string, environmentId: string): Promise<PreferencesEntity[]> {
    const workflowPreferences = await this.preferencesRepository.find({
      _templateId: workflowId,
      _environmentId: environmentId,
      type: {
        $in: [PreferencesTypeEnum.WORKFLOW_RESOURCE, PreferencesTypeEnum.USER_WORKFLOW],
      },
    });

    return workflowPreferences;
  }
}
