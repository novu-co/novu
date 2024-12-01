import { Injectable } from '@nestjs/common';
import { ControlValuesRepository, NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import {
  ControlValuesLevelEnum,
  JSONSchemaDto,
  StepTypeEnum,
  UserSessionData,
  WorkflowTestDataResponseDto,
} from '@novu/shared';

import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  Instrument,
  InstrumentUsecase,
} from '@novu/application-generic';
import { WorkflowTestDataCommand } from './build-workflow-test-data.command';
import { parsePayloadSchema } from '../../shared/parse-payload-schema';
import { flattenObjectValues, mockSchemaDefaults } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';
import { extractTemplateVars } from '../../util/template-variables/extract-template-variables';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';

@Injectable()
export class BuildWorkflowTestDataUseCase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private controlValuesRepository: ControlValuesRepository
  ) {}

  @InstrumentUsecase()
  async execute(command: WorkflowTestDataCommand): Promise<WorkflowTestDataResponseDto> {
    const _workflowEntity: NotificationTemplateEntity = await this.fetchWorkflow(command);
    const toSchema = buildToFieldSchema({ user: command.user, steps: _workflowEntity.steps });

    let payloadSchema: JSONSchemaDto;
    if (_workflowEntity.payloadSchema) {
      payloadSchema = parsePayloadSchema(_workflowEntity.payloadSchema, { safe: true }) || {};
    } else {
      payloadSchema = await this.generatePayloadVariableExample(command, _workflowEntity._id);
    }

    const payloadSchemaMock =
      payloadSchema && Object.keys(payloadSchema.properties || {}).length > 0 ? mockSchemaDefaults(payloadSchema) : {};

    return {
      to: toSchema,
      payload: payloadSchemaMock,
    };
  }

  @Instrument()
  private async generatePayloadVariableExample(
    command: WorkflowTestDataCommand,
    _workflowId: string
  ): Promise<JSONSchemaDto> {
    const controlValues = await this.controlValuesRepository.find({
      _environmentId: command.user.environmentId,
      _organizationId: command.user.organizationId,
      _workflowId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    if (!controlValues?.length) return {};

    const flattenedControls = controlValues
      .map((item) => item.controls)
      .filter((control): control is NonNullable<typeof control> => control != null);

    const concatenatedControlValues = flattenedControls.map(flattenObjectValues).flat().join(' ');

    const templateVars = extractTemplateVars(concatenatedControlValues);

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    }).payload as Record<string, unknown>;

    if (!Object.keys(variablesExample).length) return {};

    return convertJsonToSchemaWithDefaults(variablesExample);
  }

  @Instrument()
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

function buildToFieldSchema({ user, steps }: { user: UserSessionData; steps: NotificationStepEntity[] }) {
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
}

function isContainsStepType(steps: NotificationStepEntity[], type: StepTypeEnum) {
  return steps.some((step) => step.template?.type === type);
}
