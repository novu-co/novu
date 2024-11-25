import { BadRequestException, HttpException, Injectable } from '@nestjs/common';

import {
  EnvironmentEntity,
  EnvironmentRepository,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';
import {
  AnalyticsService,
  DeleteWorkflowCommand,
  DeleteWorkflowUseCase,
  ExecuteBridgeRequest,
} from '@novu/application-generic';
import {
  buildWorkflowPreferences,
  CreateWorkflowDto,
  JSONSchemaDto,
  StepCreateDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateWorkflowDto,
  UserSessionData,
  WorkflowCreationSourceEnum,
  WorkflowOriginEnum,
  WorkflowPreferences,
  WorkflowResponseDto,
  WorkflowTypeEnum,
} from '@novu/shared';
import {
  DiscoverOutput,
  DiscoverStepOutput,
  DiscoverWorkflowOutput,
  GetActionEnum,
  StepType,
} from '@novu/framework/internal';

import { SyncCommand } from './sync.command';
import { CreateBridgeResponseDto } from '../../dtos/create-bridge-response.dto';
import { UpsertWorkflowCommand } from '../../../workflows-v2/usecases/upsert-workflow/upsert-workflow.command';
import { UpsertWorkflowUseCase } from '../../../workflows-v2/usecases/upsert-workflow/upsert-workflow.usecase';

@Injectable()
export class Sync {
  constructor(
    private deleteWorkflowUseCase: DeleteWorkflowUseCase,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private environmentRepository: EnvironmentRepository,
    private executeBridgeRequest: ExecuteBridgeRequest,
    private upsertWorkflowUseCase: UpsertWorkflowUseCase,
    private analyticsService: AnalyticsService
  ) {}
  async execute(command: SyncCommand): Promise<CreateBridgeResponseDto> {
    const environment = await this.findEnvironment(command);
    const discover = await this.executeDiscover(command);

    this.sendSyncTrack(command, environment, discover);

    const upsertedWorkflows = await this.upsertWorkflows(command, discover.workflows);

    await this.disposeOldWorkflows(command, upsertedWorkflows);
    await this.updateBridgeUrl(command);

    return upsertedWorkflows;
  }

  private async findEnvironment(command: SyncCommand) {
    const environment = await this.environmentRepository.findOne({ _id: command.environmentId });

    if (!environment) {
      throw new BadRequestException('Environment not found');
    }

    return environment;
  }

  private async executeDiscover(command: SyncCommand): Promise<DiscoverOutput> {
    let discover: DiscoverOutput | undefined;
    try {
      discover = (await this.executeBridgeRequest.execute({
        statelessBridgeUrl: command.bridgeUrl,
        environmentId: command.environmentId,
        action: GetActionEnum.DISCOVER,
        retriesLimit: 1,
        workflowOrigin: WorkflowOriginEnum.EXTERNAL,
      })) as DiscoverOutput;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }

    if (!discover) {
      throw new BadRequestException('Invalid Bridge URL Response');
    }

    return discover;
  }

  private sendSyncTrack(command: SyncCommand, environment: EnvironmentEntity, discover: DiscoverOutput) {
    if (command.source !== 'sample-workspace') {
      this.analyticsService.track('Sync Request - [Bridge API]', command.userId, {
        _organization: command.organizationId,
        _environment: command.environmentId,
        environmentName: environment.name,
        workflowsCount: discover.workflows?.length || 0,
        localEnvironment: !!command.bridgeUrl?.includes('novu.sh'),
        source: command.source,
      });
    }
  }

  private async updateBridgeUrl(command: SyncCommand): Promise<void> {
    await this.environmentRepository.update(
      { _id: command.environmentId },
      {
        $set: {
          echo: {
            url: command.bridgeUrl,
          },
          bridge: {
            url: command.bridgeUrl,
          },
        },
      }
    );
  }

  private async disposeOldWorkflows(command: SyncCommand, createdWorkflows: WorkflowResponseDto[]): Promise<void> {
    const persistedWorkflowIdsInBridge = createdWorkflows.map((i) => i._id);
    const workflowsToDelete = await this.findAllWorkflowsWithOtherIds(command, persistedWorkflowIdsInBridge);
    const deleteWorkflowFromStoragePromises = workflowsToDelete.map((workflow) =>
      this.deleteWorkflowUseCase.execute(
        DeleteWorkflowCommand.create({
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          userId: command.userId,
          identifierOrInternalId: workflow._id,
        })
      )
    );

    await Promise.all([...deleteWorkflowFromStoragePromises]);
  }

  private async findAllWorkflowsWithOtherIds(
    command: SyncCommand,
    persistedWorkflowIdsInBridge: string[]
  ): Promise<NotificationTemplateEntity[]> {
    return await this.notificationTemplateRepository.find({
      _environmentId: command.environmentId,
      type: {
        $in: [WorkflowTypeEnum.ECHO, WorkflowTypeEnum.BRIDGE],
      },
      origin: {
        $in: [WorkflowOriginEnum.EXTERNAL, undefined, null],
      },
      _id: { $nin: persistedWorkflowIdsInBridge },
    });
  }

  private async upsertWorkflows(
    command: SyncCommand,
    workflowsFromBridge: DiscoverWorkflowOutput[]
  ): Promise<WorkflowResponseDto[]> {
    return Promise.all(
      workflowsFromBridge.map(async (workflow) => {
        const fetchedWorkflow = await this.notificationTemplateRepository.findByTriggerIdentifier(
          command.environmentId,
          workflow.workflowId
        );

        const upsertWorkflowCommand = fetchedWorkflow
          ? this.mapDiscoverWorkflowToUpdateWorkflowDto(fetchedWorkflow._id, command, workflow)
          : this.mapDiscoverWorkflowToCreateWorkflowDto(command, workflow);

        return await this.upsertWorkflowUseCase.execute(upsertWorkflowCommand);
      })
    );
  }

  private mapDiscoverWorkflowToCreateWorkflowDto(
    command: SyncCommand,
    workflow: DiscoverWorkflowOutput
  ): UpsertWorkflowCommand {
    const workflowDto: CreateWorkflowDto = {
      origin: WorkflowOriginEnum.EXTERNAL,
      __source: WorkflowCreationSourceEnum.BRIDGE,
      ...this.getPartialWorkflowDto(workflow),
    };

    return {
      workflowDto,
      user: {
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        _id: command.userId,
      } as UserSessionData,
    };
  }

  private getPartialWorkflowDto(workflow: DiscoverWorkflowOutput) {
    return {
      name: this.getWorkflowName(workflow),
      workflowId: workflow.workflowId,
      steps: this.mapSteps2(workflow.steps),
      controlsSchema: workflow.controls?.schema as JSONSchemaDto,
      rawData: workflow as unknown as Record<string, unknown>,
      payloadSchema: workflow.payload?.schema as JSONSchemaDto,
      active: true,
      description: this.getWorkflowDescription(workflow),
      tags: this.getWorkflowTags(workflow),
      preferences: {
        user: null,
        workflow: this.getWorkflowPreferences(workflow),
      },
    };
  }

  private mapDiscoverWorkflowToUpdateWorkflowDto(
    _workflowId: string,
    command: SyncCommand,
    workflow: DiscoverWorkflowOutput
  ): UpsertWorkflowCommand {
    const workflowDto: UpdateWorkflowDto = {
      ...this.getPartialWorkflowDto(workflow),
    };

    return {
      identifierOrInternalId: _workflowId,
      workflowDto,
      user: {
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        _id: command.userId,
      } as UserSessionData,
    };
  }

  private mapSteps2(
    commandWorkflowSteps: DiscoverStepOutput[],
    workflow?: NotificationTemplateEntity | undefined
  ): (StepCreateDto | StepUpdateDto)[] {
    return commandWorkflowSteps.map((step) => {
      const foundStep = workflow?.steps?.find((workflowStep) => workflowStep.stepId === step.stepId);

      let stepDto: StepCreateDto | StepUpdateDto;
      if (foundStep?._id) {
        stepDto = {
          _id: foundStep?._id,
          outputSchema: step.outputs.schema as JSONSchemaDto,
          controlSchema: step.controls.schema as JSONSchemaDto,
          type: this.mapStepTypeToEnum(step.type),
          name: step.stepId,
        } satisfies StepUpdateDto;
      } else {
        stepDto = {
          outputSchema: step.outputs.schema as JSONSchemaDto,
          controlSchema: step.controls.schema as JSONSchemaDto,
          type: this.mapStepTypeToEnum(step.type),
          name: step.stepId,
        } satisfies StepCreateDto;
      }

      return stepDto;
    });
  }

  private mapStepTypeToEnum(stepType: StepType): StepTypeEnum {
    switch (stepType) {
      case 'email':
        return StepTypeEnum.EMAIL;
      case 'in_app':
        return StepTypeEnum.IN_APP;
      case 'sms':
        return StepTypeEnum.SMS;
      case 'push':
        return StepTypeEnum.PUSH;
      case 'chat':
        return StepTypeEnum.CHAT;
      case 'digest':
        return StepTypeEnum.DIGEST;
      case 'delay':
        return StepTypeEnum.DELAY;
      default:
        throw new BadRequestException('Invalid step type');
    }
  }

  private getWorkflowPreferences(workflow: DiscoverWorkflowOutput): WorkflowPreferences {
    return buildWorkflowPreferences(workflow.preferences || {});
  }

  private getWorkflowName(workflow: DiscoverWorkflowOutput): string {
    return workflow.name || workflow.workflowId;
  }

  private getWorkflowDescription(workflow: DiscoverWorkflowOutput): string {
    return workflow.description || '';
  }

  private getWorkflowTags(workflow: DiscoverWorkflowOutput): string[] {
    return workflow.tags || [];
  }
}
