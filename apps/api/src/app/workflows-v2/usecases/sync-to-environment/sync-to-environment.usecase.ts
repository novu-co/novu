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
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { SyncToEnvironmentCommand } from './sync-to-environment.command';
import { GetWorkflowCommand, GetWorkflowUseCase } from '../get-workflow';
import { UpsertWorkflowCommand, UpsertWorkflowUseCase } from '../upsert-workflow';
import { BuildStepDataUsecase } from '../build-step-data';

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
    private buildStepDataUsecase: BuildStepDataUsecase
  ) {}

  @InstrumentUsecase()
  async execute(command: SyncToEnvironmentCommand): Promise<WorkflowResponseDto> {
    if (command.user.environmentId === command.targetEnvironmentId) {
      throw new BadRequestException('Cannot sync workflow to the same environment');
    }

    const originWorkflow = await this.getWorkflowToClone(command);
    const preferencesToClone = await this.getWorkflowPreferences(originWorkflow._id, command.user.environmentId);
    const externalId = originWorkflow.workflowId;
    const targetWorkflow = await this.findWorkflowInTargetEnvironment(command, externalId);
    const workflowDto = await this.buildRequestDto(originWorkflow, preferencesToClone, command, targetWorkflow);

    return await this.upsertWorkflowUseCase.execute(
      UpsertWorkflowCommand.create({
        user: { ...command.user, environmentId: command.targetEnvironmentId },
        identifierOrInternalId: targetWorkflow?._id,
        workflowDto,
      })
    );
  }

  @Instrument()
  private async buildRequestDto(
    originWorkflow: WorkflowResponseDto,
    preferencesToClone: PreferencesEntity[],
    command: SyncToEnvironmentCommand,
    targetWorkflow?: WorkflowResponseDto
  ) {
    if (targetWorkflow) {
      return await this.mapWorkflowToUpdateWorkflowDto(originWorkflow, targetWorkflow, preferencesToClone, command);
    }

    return await this.mapWorkflowToCreateWorkflowDto(originWorkflow, preferencesToClone, command);
  }

  @Instrument()
  private async getWorkflowToClone(command: SyncToEnvironmentCommand): Promise<WorkflowResponseDto> {
    return this.getWorkflowUseCase.execute(
      GetWorkflowCommand.create({
        user: command.user,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  @Instrument()
  private async findWorkflowInTargetEnvironment(
    command: SyncToEnvironmentCommand,
    externalId: string
  ): Promise<WorkflowResponseDto | undefined> {
    try {
      return await this.getWorkflowUseCase.execute(
        GetWorkflowCommand.create({
          user: { ...command.user, environmentId: command.targetEnvironmentId },
          identifierOrInternalId: externalId,
        })
      );
    } catch (error) {
      return undefined;
    }
  }

  @Instrument()
  private async mapWorkflowToCreateWorkflowDto(
    originWorkflow: WorkflowResponseDto,
    preferences: PreferencesEntity[],
    command: SyncToEnvironmentCommand
  ): Promise<CreateWorkflowDto> {
    return {
      workflowId: originWorkflow.workflowId,
      name: originWorkflow.name,
      active: originWorkflow.active,
      tags: originWorkflow.tags,
      description: originWorkflow.description,
      __source: WorkflowCreationSourceEnum.DASHBOARD,
      steps: await this.mapStepsToDto(originWorkflow.steps, command),
      preferences: this.mapPreferences(preferences),
    };
  }

  @Instrument()
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

  @Instrument()
  private async mapStepsToDto(
    originSteps: StepResponseDto[],
    command: SyncToEnvironmentCommand,
    targetWorkflowSteps?: StepResponseDto[]
  ): Promise<(StepUpdateDto | StepCreateDto)[]> {
    const augmentedSteps: (StepUpdateDto | StepCreateDto)[] = [];
    for (const originStep of originSteps) {
      const idAsOptionalObject = this.prodDbIdAsOptionalObject(originStep, targetWorkflowSteps);
      const stepDataDto = await this.buildStepDataUsecase.execute({
        identifierOrInternalId: command.identifierOrInternalId,
        stepId: originStep.stepId,
        user: command.user,
      });

      augmentedSteps.push(this.buildSingleStepRequest(idAsOptionalObject, originStep, stepDataDto));
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

  private prodDbIdAsOptionalObject(originStep: StepResponseDto, targetWorkflowSteps?: StepResponseDto[]) {
    const prodDatabaseId = this.findDatabaseIdInProdByExternalId(originStep, targetWorkflowSteps);

    if (prodDatabaseId) {
      return {
        _id: prodDatabaseId,
      };
    } else {
      return {};
    }
  }

  private findDatabaseIdInProdByExternalId(originStep: StepResponseDto, targetWorkflowSteps?: StepResponseDto[]) {
    return targetWorkflowSteps?.find((targetStep) => targetStep.stepId === originStep.stepId)?._id;
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
    return await this.preferencesRepository.find({
      _templateId: workflowId,
      _environmentId: environmentId,
      type: {
        $in: [PreferencesTypeEnum.WORKFLOW_RESOURCE, PreferencesTypeEnum.USER_WORKFLOW],
      },
    });
  }
}
