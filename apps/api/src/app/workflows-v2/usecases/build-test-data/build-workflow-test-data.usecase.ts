import { Injectable } from '@nestjs/common';
import { NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { JSONSchemaDto, StepTypeEnum, UserSessionData, WorkflowTestDataResponseDto } from '@novu/shared';

import { GetWorkflowByIdsCommand, GetWorkflowByIdsUseCase } from '@novu/application-generic';
import { WorkflowTestDataCommand } from './build-workflow-test-data.command';

@Injectable()
export class BuildWorkflowTestDataUseCase {
  constructor(private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase) {}

  async execute(command: WorkflowTestDataCommand): Promise<WorkflowTestDataResponseDto> {
    const _workflowEntity: NotificationTemplateEntity = await this.fetchWorkflow(command);
    const toSchema = buildToFieldSchema({ user: command.user, steps: _workflowEntity.steps });
    const payloadSchema = JSON.parse(_workflowEntity.payloadSchema);

    return {
      to: toSchema,
      payload: payloadSchema,
    };
  }

  private async fetchWorkflow(command: WorkflowTestDataCommand): Promise<NotificationTemplateEntity> {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }
}

const buildToFieldSchema = ({ user, steps }: { user: UserSessionData; steps: NotificationStepEntity[] }) => {
  const isEmailExist = isContainsStepType(steps, StepTypeEnum.EMAIL);
  const isSmsExist = isContainsStepType(steps, StepTypeEnum.SMS);

  return {
    type: 'object',
    properties: {
      subscriberId: { type: 'string', default: user._id },
      ...(isEmailExist ? { email: { type: 'string', default: user.email ?? '', format: 'email' } } : {}),
      ...(isSmsExist ? { phone: { type: 'string', default: '' } } : {}),
    },
    required: ['subscriberId', ...(isEmailExist ? ['email'] : []), ...(isSmsExist ? ['phone'] : [])],
    additionalProperties: false,
  } as const satisfies JSONSchemaDto;
};

function isContainsStepType(steps: NotificationStepEntity[], type: StepTypeEnum) {
  return steps.some((step) => step.template?.type === type);
}
