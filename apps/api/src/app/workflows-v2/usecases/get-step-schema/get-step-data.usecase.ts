import { BadRequestException, Injectable } from '@nestjs/common';
import { ControlValuesRepository, NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { GetWorkflowByIdsUseCase } from '@novu/application-generic';

import { ControlValuesLevelEnum, StepDataDto } from '@novu/shared';
import { GetStepDataCommand } from './get-step-data.command';
import { InvalidStepException } from '../../exceptions/invalid-step.exception';
import { BuildDefaultPayloadUseCase } from '../build-payload-from-placeholder';
import { BuildAvailableVariableSchemaUsecase } from './build-available-variable-schema-usecase.service';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';

@Injectable()
export class GetStepDataUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildDefaultPayloadUseCase: BuildDefaultPayloadUseCase,
    private controlValuesRepository: ControlValuesRepository,
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase // Dependency injection for new use case
  ) {}

  async execute(command: GetStepDataCommand): Promise<StepDataDto> {
    const workflow = await this.fetchWorkflow(command);

    const { currentStep, previousSteps } = await this.loadStepsFromDb(command, workflow);
    if (!currentStep.name || !currentStep._templateId || !currentStep.stepId) {
      throw new InvalidStepException(currentStep);
    }
    const controlValues = await this.getValues(command, currentStep, workflow._id);
    const payloadSchema = this.buildPayloadSchema(controlValues);

    return {
      controls: {
        dataSchema: currentStep.template?.controls?.schema,
        uiSchema: currentStep.template?.controls?.uiSchema,
        values: controlValues,
      },
      variables: this.buildAvailableVariableSchemaUsecase.execute({
        previousSteps,
        payloadSchema,
      }), // Use the new use case to build variables schema
      name: currentStep.name,
      _id: currentStep._templateId,
      stepId: currentStep.stepId,
    };
  }

  private buildPayloadSchema(controlValues: Record<string, unknown>) {
    const payloadVariables = this.buildDefaultPayloadUseCase.execute({
      controlValues,
    }).previewPayload.payload;

    return convertJsonToSchemaWithDefaults(payloadVariables);
  }

  private async fetchWorkflow(command: GetStepDataCommand) {
    const workflow = await this.getWorkflowByIdsUseCase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      userId: command.user._id,
    });

    if (!workflow) {
      throw new BadRequestException({
        message: 'No workflow found',
        workflowId: command.identifierOrInternalId,
      });
    }

    return workflow;
  }

  private async getValues(command: GetStepDataCommand, currentStep: NotificationStepEntity, _workflowId: string) {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId: command.user.environmentId,
      _organizationId: command.user.organizationId,
      _workflowId,
      _stepId: currentStep._templateId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controlValuesEntity?.controls || {};
  }

  private async loadStepsFromDb(command: GetStepDataCommand, workflow: NotificationTemplateEntity) {
    const currentStep = workflow.steps.find(
      (stepItem) => stepItem._id === command.stepId || stepItem.stepId === command.stepId
    );

    if (!currentStep) {
      throw new BadRequestException({
        message: 'No step found',
        stepId: command.stepId,
        workflowId: command.identifierOrInternalId,
      });
    }

    const previousSteps = workflow.steps.slice(
      0,
      workflow.steps.findIndex((stepItem) => stepItem._id === command.stepId)
    );

    return { currentStep, previousSteps };
  }
}
