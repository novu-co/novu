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
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';

@Injectable()
export class BuildWorkflowTestDataUseCase {
  constructor(
    private readonly getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private readonly controlValuesRepository: ControlValuesRepository
  ) {}

  @InstrumentUsecase()
  async execute(command: WorkflowTestDataCommand): Promise<WorkflowTestDataResponseDto> {
    const workflow = await this.fetchWorkflow(command);
    const toSchema = this.buildToFieldSchema({ user: command.user, steps: workflow.steps });
    const payloadSchema = await this.resolvePayloadSchema(workflow, command);
    const payloadSchemaMock = this.generatePayloadMock(payloadSchema);

    return {
      to: toSchema,
      payload: payloadSchemaMock,
    };
  }

  @Instrument()
  private async resolvePayloadSchema(
    workflow: NotificationTemplateEntity,
    command: WorkflowTestDataCommand
  ): Promise<JSONSchemaDto> {
    if (workflow.payloadSchema) {
      return parsePayloadSchema(workflow.payloadSchema, { safe: true }) || {};
    }

    return this.generatePayloadSchema({
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      workflowId: workflow._id,
    });
  }

  private generatePayloadMock(schema: JSONSchemaDto): Record<string, unknown> {
    if (!schema?.properties || Object.keys(schema.properties).length === 0) {
      return {};
    }

    return mockSchemaDefaults(schema);
  }

  @Instrument()
  private async generatePayloadSchema({
    environmentId,
    organizationId,
    workflowId,
  }: {
    environmentId: string;
    organizationId: string;
    workflowId: string;
  }): Promise<JSONSchemaDto> {
    const controlValues = await this.controlValuesRepository.find({
      _environmentId: environmentId,
      _organizationId: organizationId,
      _workflowId: workflowId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    if (!controlValues?.length) {
      return {};
    }

    const templateVars = this.extractTemplateVariables(controlValues);
    if (templateVars.length === 0) {
      return {};
    }

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    }).payload as Record<string, unknown>;

    return convertJsonToSchemaWithDefaults(variablesExample);
  }

  private extractTemplateVariables(controlValues: Array<{ controls: unknown | null }>): string[] {
    const flattenedControls = controlValues
      .map((item) => item.controls)
      .filter((control): control is NonNullable<typeof control> => control != null);

    const concatenatedControlValues = flattenedControls.map(flattenObjectValues).flat().join(' ');

    return extractLiquidTemplateVariables(concatenatedControlValues).validVariables;
  }

  @Instrument()
  private async fetchWorkflow(command: WorkflowTestDataCommand): Promise<NotificationTemplateEntity> {
    return this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );
  }

  private buildToFieldSchema({
    user,
    steps,
  }: {
    user: UserSessionData;
    steps: NotificationStepEntity[];
  }): JSONSchemaDto {
    const hasEmailStep = this.hasStepType(steps, StepTypeEnum.EMAIL);
    const hasSmsStep = this.hasStepType(steps, StepTypeEnum.SMS);

    const properties: { [key: string]: JSONSchemaDto } = {
      subscriberId: { type: 'string', default: user._id },
    };

    const required: string[] = ['subscriberId'];

    if (hasEmailStep) {
      properties.email = { type: 'string', default: user.email ?? '', format: 'email' };
      required.push('email');
    }

    if (hasSmsStep) {
      properties.phone = { type: 'string', default: '' };
      required.push('phone');
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    } satisfies JSONSchemaDto;
  }

  private hasStepType(steps: NotificationStepEntity[], type: StepTypeEnum): boolean {
    return steps.some((step) => step.template?.type === type);
  }
}
