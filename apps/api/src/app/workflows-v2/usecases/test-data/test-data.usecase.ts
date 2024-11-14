import { Injectable } from '@nestjs/common';
import { ControlValuesRepository, NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import {
  ControlValuesLevelEnum,
  JSONSchemaDto,
  StepTypeEnum,
  UserSessionData,
  WorkflowTestDataResponseDto,
} from '@novu/shared';

import { GetWorkflowByIdsCommand, GetWorkflowByIdsUseCase } from '@novu/application-generic';
import { WorkflowTestDataCommand } from './test-data.command';
import { BuildDefaultPayloadUseCase } from '../build-payload-from-placeholder';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';

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
    const payloadSchema = await this.buildAggregateWorkflowPayloadSchema(command, _workflowEntity);

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

  private async buildAggregateWorkflowPayloadSchema(
    command: WorkflowTestDataCommand,
    _workflowEntity: NotificationTemplateEntity
  ): Promise<JSONSchemaDto> {
    let payloadExampleForWorkflow: Record<string, unknown> = {};
    for (const step of _workflowEntity.steps) {
      const controlValuesForStep = await this.getValues(command.user, step._templateId, _workflowEntity._id);
      const payloadExampleForStep = this.buildDefaultPayloadUseCase.execute({
        controlValues: controlValuesForStep,
      }).previewPayload.payload;
      payloadExampleForWorkflow = { ...payloadExampleForWorkflow, ...payloadExampleForStep };
    }

    return convertJsonToSchemaWithDefaults(payloadExampleForWorkflow);
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
