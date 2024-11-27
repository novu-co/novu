import { BadRequestException, Injectable } from '@nestjs/common';
import { ControlValuesLevelEnum, StepDataDto, WorkflowOriginEnum } from '@novu/shared';
import { ControlValuesRepository, NotificationStepEntity, NotificationTemplateEntity } from '@novu/dal';
import { GetWorkflowByIdsUseCase } from '@novu/application-generic';
import { BuildStepDataCommand } from './build-step-data.command';
import { InvalidStepException } from '../../exceptions/invalid-step.exception';
import { BuildAvailableVariableSchemaUsecase } from '../build-variable-schema';

@Injectable()
export class BuildStepDataUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private controlValuesRepository: ControlValuesRepository,
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase
  ) {}

  async execute(command: BuildStepDataCommand): Promise<StepDataDto> {
    const workflow = await this.fetchWorkflow(command);

    const { currentStep } = await this.loadStepsFromDb(command, workflow);
    if (
      currentStep.name === undefined ||
      !currentStep._templateId ||
      currentStep.stepId === undefined ||
      !currentStep.template?.type
    ) {
      throw new InvalidStepException(currentStep);
    }
    const controlValues = await this.getValues(command, currentStep, workflow._id);

    return {
      controls: {
        dataSchema: currentStep.template?.controls?.schema,
        uiSchema: currentStep.template?.controls?.uiSchema,
        values: controlValues,
      },
      variables: this.buildAvailableVariableSchemaUsecase.execute({
        stepDatabaseId: currentStep._templateId,
        workflow,
      }),
      name: currentStep.name,
      _id: currentStep._templateId,
      stepId: currentStep.stepId,
      type: currentStep.template?.type,
      origin: workflow.origin || WorkflowOriginEnum.EXTERNAL,
      workflowId: workflow.triggers[0].identifier,
      workflowDatabaseId: workflow._id,
      issues: currentStep.issues,
    };
  }

  private async fetchWorkflow(command: BuildStepDataCommand) {
    return await this.getWorkflowByIdsUseCase.execute({
      identifierOrInternalId: command.workflowIdentifierOrInternalId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      userId: command.user._id,
    });
  }

  private async getValues(command: BuildStepDataCommand, currentStep: NotificationStepEntity, _workflowId: string) {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId: command.user.environmentId,
      _organizationId: command.user.organizationId,
      _workflowId,
      _stepId: currentStep._templateId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controlValuesEntity?.controls || {};
  }

  private async loadStepsFromDb(command: BuildStepDataCommand, workflow: NotificationTemplateEntity) {
    const currentStep = workflow.steps.find(
      (stepItem) => stepItem._id === command.stepIdOrInternalId || stepItem.stepId === command.stepIdOrInternalId
    );

    if (!currentStep) {
      throw new BadRequestException({
        message: 'No step found',
        stepId: command.stepIdOrInternalId,
        workflowId: command.workflowIdentifierOrInternalId,
      });
    }

    return { currentStep };
  }
}
