import { Injectable } from '@nestjs/common';
import { ControlValuesRepository, NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import {
  ControlValuesLevelEnum,
  JSONSchemaDto,
  StepTypeEnum,
  UserSessionData,
  WorkflowTestDataResponseDto,
} from '@novu/shared';

import { WorkflowTestDataCommand } from './test-data.command';
import { GetWorkflowByIdsUseCase } from '../get-workflow-by-ids/get-workflow-by-ids.usecase';
import { GetWorkflowByIdsCommand } from '../get-workflow-by-ids/get-workflow-by-ids.command';
import { BuildDefaultPayloadUseCase } from '../build-payload-from-placeholder';
import { buildJSONSchema } from '../../shared/build-string-schema';

@Injectable()
export class WorkflowTestDataUseCase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private controlValuesRepository: ControlValuesRepository,
    private buildDefaultPayloadUseCase: BuildDefaultPayloadUseCase
  ) {}

  async execute(command: WorkflowTestDataCommand): Promise<WorkflowTestDataResponseDto> {
    const _workflowEntity: NotificationTemplateEntity = await this.fetchWorkflow(command);
    const toSchema = buildToFieldSchema({ user: command.user, steps: _workflowEntity.steps });
    const payloadSchema = await this.buildPayloadSchema(command, _workflowEntity);

    return {
      to: toSchema,
      payload: payloadSchema,
    };
  }

  private async fetchWorkflow(command: WorkflowTestDataCommand): Promise<NotificationTemplateEntity> {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        ...command,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  private async buildPayloadSchema(command: WorkflowTestDataCommand, _workflowEntity: NotificationTemplateEntity) {
    let payloadVariables: Record<string, unknown> = {};
    for (const step of _workflowEntity.steps) {
      const newValues = await this.getValues(command.user, step._templateId, _workflowEntity._id);

      /*
       *  we need to build the payload defaults for each step,
       *  because of possible duplicated values (like subject, body, etc...)
       */
      const currPayloadVariables = this.buildDefaultPayloadUseCase.execute({
        controlValues: newValues,
      }).previewPayload.payload;
      payloadVariables = { ...payloadVariables, ...currPayloadVariables };
    }

    return buildJSONSchema(payloadVariables || {});
  }

  private async getValues(user: UserSessionData, _stepId: string, _workflowId: string) {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId: user.environmentId,
      _organizationId: user.organizationId,
      _workflowId,
      _stepId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controlValuesEntity?.controls || {};
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
