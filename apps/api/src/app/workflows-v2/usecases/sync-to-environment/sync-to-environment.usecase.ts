import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateWorkflowDto,
  PreferencesTypeEnum,
  StepCreateDto,
  StepDataDto,
  StepResponseDto,
  StepUpdateDto,
  UpdateWorkflowDto,
  WorkflowCreationSourceEnum,
  WorkflowPreferences,
  WorkflowResponseDto,
} from '@novu/shared';
import { PreferencesEntity, PreferencesRepository } from '@novu/dal';
import { SyncToEnvironmentCommand } from './sync-to-environment.command';
import { GetWorkflowByIdsCommand } from '../get-workflow-by-ids/get-workflow-by-ids.command';
import { UpsertWorkflowUseCase } from '../upsert-workflow/upsert-workflow.usecase';
import { UpsertWorkflowCommand } from '../upsert-workflow/upsert-workflow.command';
import { GetWorkflowUseCase } from '../get-workflow/get-workflow.usecase';
import { GetStepDataUsecase } from '../get-step-schema/get-step-data.usecase';

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
    private getWorkflowUseCase: GetWorkflowUseCase,
    private preferencesRepository: PreferencesRepository,
    private upsertWorkflowUseCase: UpsertWorkflowUseCase,
    private getStepData: GetStepDataUsecase
  ) {}

  async execute(command: SyncToEnvironmentCommand): Promise<WorkflowResponseDto> {
    if (command.user.environmentId === command.targetEnvironmentId) {
      throw new BadRequestException('Cannot sync workflow to the same environment');
    }

    const workflowToClone = await this.getWorkflowToClone(command);
    const preferencesToClone = await this.getWorkflowPreferences(workflowToClone._id, command.user.environmentId);
    const externalId = workflowToClone.workflowId;
    const existingWorkflow = await this.findWorkflowInTargetEnvironment(command, externalId);
    const workflowDto = await this.buildRequestDto(workflowToClone, preferencesToClone, command, existingWorkflow);

    return await this.upsertWorkflowUseCase.execute(
      UpsertWorkflowCommand.create({
        user: { ...command.user, environmentId: command.targetEnvironmentId },
        identifierOrInternalId: existingWorkflow?._id,
        workflowDto,
      })
    );
  }

  private async buildRequestDto(
    workflowToClone: WorkflowResponseDto,
    preferencesToClone: PreferencesEntity[],
    command: SyncToEnvironmentCommand,
    existingWorkflow?: WorkflowResponseDto
  ) {
    if (existingWorkflow) {
      return await this.mapWorkflowToUpdateWorkflowDto(workflowToClone, existingWorkflow, preferencesToClone, command);
    }

    return await this.mapWorkflowToCreateWorkflowDto(workflowToClone, preferencesToClone, command);
  }

  private async getWorkflowToClone(command: SyncToEnvironmentCommand): Promise<WorkflowResponseDto> {
    return this.getWorkflowUseCase.execute(
      GetWorkflowByIdsCommand.create({
        user: command.user,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  private async findWorkflowInTargetEnvironment(
    command: SyncToEnvironmentCommand,
    externalId: string
  ): Promise<WorkflowResponseDto | undefined> {
    try {
      return await this.getWorkflowUseCase.execute(
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
    workflowToClone: WorkflowResponseDto,
    preferences: PreferencesEntity[],
    command: SyncToEnvironmentCommand
  ): Promise<CreateWorkflowDto> {
    return {
      workflowId: workflowToClone.workflowId,
      name: workflowToClone.name,
      active: workflowToClone.active,
      tags: workflowToClone.tags,
      description: workflowToClone.description,
      __source: WorkflowCreationSourceEnum.DASHBOARD,
      steps: await this.mapStepsToDto(workflowToClone.steps, command),
      preferences: this.mapPreferences(preferences),
    };
  }

  private async mapWorkflowToUpdateWorkflowDto(
    originWorkflow: WorkflowResponseDto,
    existingWorkflowInProd: WorkflowResponseDto | undefined,
    preferencesToClone: PreferencesEntity[],
    command: SyncToEnvironmentCommand
  ): Promise<UpdateWorkflowDto> {
    return {
      workflowId: originWorkflow.workflowId,
      name: originWorkflow.name,
      active: originWorkflow.active,
      tags: originWorkflow.tags,
      description: originWorkflow.description,
      steps: await this.mapStepsToDto(originWorkflow.steps, command, existingWorkflowInProd?.steps),
      preferences: this.mapPreferences(preferencesToClone),
    };
  }

  private async mapStepsToDto(
    steps: StepResponseDto[],
    command: SyncToEnvironmentCommand,
    existingWorkflowSteps?: StepResponseDto[]
  ): Promise<(StepUpdateDto | StepCreateDto)[]> {
    const augmentedSteps: (StepUpdateDto | StepCreateDto)[] = [];
    for (const step of steps) {
      const idAsOptionalObject = this.prodDbIdAsOptionalObject(existingWorkflowSteps, step);
      const stepDataDto = await this.getStepData.execute({
        identifierOrInternalId: command.identifierOrInternalId,
        stepId: step.stepId,
        user: command.user,
      });

      augmentedSteps.push(this.buildSingleStepRequest(idAsOptionalObject, step, stepDataDto));
    }

    return augmentedSteps;
  }
  /*
   * If we are updating an existing workflow, we need to map the updated steps to the existing steps
   * (!) 'existingWorkflowSteps' are from a different environment than 'steps' - the only thing that doesn't change
   *  in steps across environments is the stepId (TODO)
   */
  private buildSingleStepRequest(
    idAsOptionalObject: { _id: string } | {},
    step: StepResponseDto,
    stepDataDto: StepDataDto
  ): StepUpdateDto | StepCreateDto {
    return {
      ...idAsOptionalObject,
      name: step.name ?? '',
      type: step.type,
      controlValues: stepDataDto.controls.values ?? {},
    };
  }

  private prodDbIdAsOptionalObject(existingWorkflowSteps: StepResponseDto[] | undefined, step: StepResponseDto) {
    const prodDatabaseId = this.findDatabaseIdInProdByExternalId(existingWorkflowSteps, step);

    if (prodDatabaseId) {
      return {
        _id: prodDatabaseId,
      };
    } else {
      return {};
    }
  }

  private findDatabaseIdInProdByExternalId(
    existingWorkflowSteps: StepResponseDto[] | undefined,
    step: StepResponseDto
  ) {
    return existingWorkflowSteps?.find((existingStep) => existingStep.stepId === step.stepId)?._id ?? step._id;
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
