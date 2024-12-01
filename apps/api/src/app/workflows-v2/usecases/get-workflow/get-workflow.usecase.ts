import { Injectable } from '@nestjs/common';

import { WorkflowResponseDto } from '@novu/shared';
import { GetWorkflowByIdsCommand, GetWorkflowByIdsUseCase, InstrumentUsecase } from '@novu/application-generic';

import { GetWorkflowCommand } from './get-workflow.command';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';

@Injectable()
export class GetWorkflowUseCase {
  constructor(private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase) {}

  @InstrumentUsecase()
  async execute(command: GetWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowEntity = await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );

    return toResponseWorkflowDto(workflowEntity);
  }
}
