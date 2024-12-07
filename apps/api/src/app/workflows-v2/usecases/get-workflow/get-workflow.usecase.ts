import { Injectable } from '@nestjs/common';

import { StepDataDto, UserSessionData, WorkflowResponseDto } from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  InstrumentUsecase,
  WorkflowInternalResponseDto,
} from '@novu/application-generic';

import { GetWorkflowCommand } from './get-workflow.command';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';
import { BuildStepDataUsecase } from '../build-step-data/build-step-data.usecase';
import { BuildStepDataCommand } from '../build-step-data/build-step-data.command';
import { NotificationStepEntity } from '@novu/dal';

@Injectable()
export class GetWorkflowUseCase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildStepDataUsecase: BuildStepDataUsecase
  ) {}

  @InstrumentUsecase()
  async execute(command: GetWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowEntity = await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        workflowIdOrInternalId: command.workflowIdOrInternalId,
      })
    );

    const fullSteps = await this.getFullWorkflowSteps(workflowEntity, command.user);

    return toResponseWorkflowDto(workflowEntity, fullSteps);
  }

  private async getFullWorkflowSteps(
    workflow: WorkflowInternalResponseDto,
    user: UserSessionData
  ): Promise<StepDataDto[]> {
    const stepPromises = workflow.steps.map((step: NotificationStepEntity & { _id: string }) =>
      this.buildStepDataUsecase.execute(
        BuildStepDataCommand.create({
          workflowIdOrInternalId: workflow._id,
          stepIdOrInternalId: step._id,
          user,
        })
      )
    );

    try {
      return Promise.all(stepPromises);
    } catch (error) {
      throw new Error(`Failed to build full workflow steps: ${error.message}`);
    }
  }
}
