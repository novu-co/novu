import { BadRequestException, Injectable } from '@nestjs/common';
import { ControlValuesLevelEnum, StepDataDto } from '@novu/shared';
import { JSONSchema } from 'json-schema-to-ts';
import { ControlValuesRepository, NotificationStepEntity } from '@novu/dal';
import { GetStepDataCommand } from './get-step-data.command';
import { mapStepTypeToResult } from '../../shared';
import { GetWorkflowByIdsUseCase } from '../get-workflow-by-ids/get-workflow-by-ids.usecase';
import { InvalidStepException } from '../../exceptions/invalid-step.exception';

@Injectable()
export class GetStepDataUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private controlValuesRepository: ControlValuesRepository
  ) {}

  async execute(command: GetStepDataCommand): Promise<StepDataDto> {
    const { currentStep, previousSteps } = await this.findSteps(command);
    if (!currentStep.name || !currentStep._templateId || !currentStep.stepId) {
      throw new InvalidStepException(currentStep);
    }

    return {
      controls: {
        dataSchema: currentStep.template?.controls?.schema,
        uiSchema: currentStep.template?.controls?.uiSchema,
        values: await this.getValues(command, currentStep),
      },
      variables: buildVariablesSchema(previousSteps),
      name: currentStep.name,
      _id: currentStep._templateId,
      stepId: currentStep.stepId,
    };
  }

  private async getValues(command: GetStepDataCommand, currentStep: NotificationStepEntity) {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId: command.user.environmentId,
      _organizationId: command.user.organizationId,
      _workflowId: command.workflowId,
      _stepId: currentStep._templateId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controlValuesEntity?.controls || {};
  }

  private async findSteps(command: GetStepDataCommand) {
    const workflow = await this.getWorkflowByIdsUseCase.execute({
      identifierOrInternalId: command.workflowId,
      user: command.user,
    });

    if (!workflow) {
      throw new BadRequestException({
        message: 'No workflow found',
        workflowId: command.workflowId,
      });
    }

    const currentStep = workflow.steps.find((stepItem) => stepItem._id === command.stepId);

    if (!currentStep) {
      throw new BadRequestException({
        message: 'No step found',
        stepId: command.stepId,
        workflowId: command.workflowId,
      });
    }

    const previousSteps = workflow.steps.slice(
      0,
      workflow.steps.findIndex((stepItem) => stepItem._id === command.stepId)
    );

    return { currentStep, previousSteps };
  }
}

const buildSubscriberSchema = () =>
  ({
    type: 'object',
    description: 'Schema representing the subscriber entity',
    properties: {
      firstName: { type: 'string', description: "Subscriber's first name" },
      lastName: { type: 'string', description: "Subscriber's last name" },
      email: { type: 'string', description: "Subscriber's email address" },
      phone: { type: 'string', description: "Subscriber's phone number (optional)" },
      avatar: { type: 'string', description: "URL to the subscriber's avatar image (optional)" },
      locale: { type: 'string', description: 'Locale for the subscriber (optional)' },
      subscriberId: { type: 'string', description: 'Unique identifier for the subscriber' },
      isOnline: { type: 'boolean', description: 'Indicates if the subscriber is online (optional)' },
      lastOnlineAt: {
        type: 'string',
        format: 'date-time',
        description: 'The last time the subscriber was online (optional)',
      },
    },
    required: ['firstName', 'lastName', 'email', 'subscriberId'],
    additionalProperties: false,
  }) as const satisfies JSONSchema;

function buildVariablesSchema(previousSteps?: NotificationStepEntity[]): JSONSchema {
  return {
    type: 'object',
    properties: {
      subscriber: buildSubscriberSchema(),
      steps: buildPreviousStepsSchema(previousSteps),
    },
    additionalProperties: false,
  } as const satisfies JSONSchema;
}

function buildPreviousStepsSchema(previousSteps: NotificationStepEntity[] | undefined) {
  type StepExternalId = string;
  let previousStepsProperties: Record<StepExternalId, JSONSchema> = {};

  previousStepsProperties = (previousSteps || []).reduce(
    (acc, step) => {
      if (step.stepId && step.template?.type) {
        acc[step.stepId] = mapStepTypeToResult[step.template.type];
      }

      return acc;
    },
    {} as Record<StepExternalId, JSONSchema>
  );

  return {
    type: 'object',
    properties: previousStepsProperties,
    required: [],
    additionalProperties: false,
    description: 'Previous Steps Results',
  } as const satisfies JSONSchema;
}
