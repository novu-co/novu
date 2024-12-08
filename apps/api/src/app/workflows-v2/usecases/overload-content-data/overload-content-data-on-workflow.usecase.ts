import { Injectable } from '@nestjs/common';
import { ControlValuesLevelEnum, UserSessionData } from '@novu/shared';
import { ControlValuesRepository, NotificationStepEntity } from '@novu/dal';
import { WorkflowInternalResponseDto } from '@novu/application-generic';
import { PrepareAndValidateContentUsecase, ValidatedContentResponse } from '../validate-content';
import { BuildAvailableVariableSchemaUsecase } from '../build-variable-schema';
import { OverloadContentDataOnWorkflowCommand } from './overload-content-data-on-workflow.command';
import { StepMissingControlsException } from '../../exceptions/step-not-found-exception';

@Injectable()
export class OverloadContentDataOnWorkflowUseCase {
  constructor(
    private controlValuesRepository: ControlValuesRepository,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase,
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase
  ) {}

  async execute(command: OverloadContentDataOnWorkflowCommand): Promise<WorkflowInternalResponseDto> {
    const validatedContentResponses = await this.validateStepContent(command.workflow, command.user);
    for (const step of command.workflow.steps) {
      if (!step.issues) {
        step.issues = {};
      }
      if (!step.issues?.controls) {
        step.issues.controls = {};
      }
      step.issues.controls = validatedContentResponses[step._templateId].issues;
    }

    return command.workflow;
  }

  private async validateStepContent(workflow: WorkflowInternalResponseDto, user: UserSessionData) {
    const stepIdToControlValuesMap = await this.buildValuesMap(workflow, user);
    const validatedStepContent: Record<string, ValidatedContentResponse> = {};

    for (const step of workflow.steps) {
      const controls = step.template?.controls;
      if (!controls) {
        throw new StepMissingControlsException(step._templateId, step);
      }
      const controlValues = stepIdToControlValuesMap[step._templateId];

      const jsonSchemaDto = await this.buildAvailableVariableSchemaUsecase.execute({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
        workflow,
        stepInternalId: step._templateId,
      });
      validatedStepContent[step._templateId] = await this.prepareAndValidateContentUsecase.execute({
        stepType: step?.template?.type,
        controlDataSchema: controls.schema,
        controlValues,
        variableSchema: jsonSchemaDto,
        user,
      });
    }

    return validatedStepContent;
  }

  private async buildValuesMap(
    workflow: WorkflowInternalResponseDto,
    user: UserSessionData
  ): Promise<Record<string, Record<string, unknown>>> {
    const stepIdToControlValuesMap: Record<string, Record<string, unknown>> = {};
    for (const step of workflow.steps) {
      stepIdToControlValuesMap[step._templateId] = await this.getValues(step, workflow._id, user);
    }

    return stepIdToControlValuesMap;
  }

  private async getValues(currentStep: NotificationStepEntity, _workflowId: string, user: UserSessionData) {
    const controlValuesEntity = await this.controlValuesRepository.findOne({
      _environmentId: user.environmentId,
      _organizationId: user.organizationId,
      _workflowId,
      _stepId: currentStep._templateId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    return controlValuesEntity?.controls || {};
  }
}
