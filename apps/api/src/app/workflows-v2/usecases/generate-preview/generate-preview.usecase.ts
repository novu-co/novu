import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ChannelTypeEnum,
  GeneratePreviewRequestDto,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepDataDto,
  UserSessionData,
  WorkflowOriginEnum,
} from '@novu/shared';
import { GetWorkflowByIdsCommand, GetWorkflowByIdsUseCase } from '@novu/application-generic';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { StepMissingControlsException } from '../../exceptions/step-not-found-exception';
import { PrepareAndValidateContentUsecase, ValidatedContentResponse } from '../validate-content';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { mergeObjects } from '../../util/jsonUtils';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase
  ) {}

  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    const dto = command.generatePreviewRequestDto;
    const stepData = await this.getStepData(command);
    const workflow = await this.findWorkflow(command);

    const validatedContent: ValidatedContentResponse = await this.getValidatedContent(dto, stepData, command.user);
    const hydratedExampleVariables = this.normalizeExampleVariables(
      validatedContent,
      workflow.origin,
      workflow.payloadSchema
    );

    const executeOutput = await this.executePreviewUsecase(
      command,
      stepData,
      hydratedExampleVariables,
      validatedContent.finalControlValues
    );

    return {
      issues: validatedContent.issues,
      result: {
        preview: executeOutput.outputs as any,
        type: stepData.type as unknown as ChannelTypeEnum,
      },
      previewPayloadExample: hydratedExampleVariables,
    };
  }

  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        identifierOrInternalId: command.identifierOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  /**
   * Generates a payload based solely on the schema.
   * Supports nested schemas and applies defaults where defined.
   * @param JSONSchemaDto - Defining the structure. example:
   *  {
   *    firstName: { type: 'string', default: 'John' },
   *    lastName: { type: 'string' }
   *  }
   * @returns - Generated payload. example: { firstName: 'John', lastName: '{{payload.lastName}}' }
   */
  private generatePayloadVariableExample(schema: JSONSchemaDto, path = 'payload'): Record<string, unknown> {
    if (schema.type !== 'object' || !schema.properties) {
      throw new Error('Schema must define an object with properties.');
    }

    return Object.entries(schema.properties).reduce((acc, [key, definition]) => {
      if (typeof definition === 'boolean') {
        return acc;
      }

      const currentPath = `${path}.${key}`;

      if (definition.default) {
        acc[key] = definition.default;
      } else if (definition.type === 'object' && definition.properties) {
        acc[key] = this.generatePayloadVariableExample(definition, currentPath);
      } else {
        acc[key] = `{{${currentPath}}}`;
      }

      return acc;
    }, {});
  }

  private async getValidatedContent(dto: GeneratePreviewRequestDto, stepData: StepDataDto, user: UserSessionData) {
    if (!stepData.controls?.dataSchema) {
      throw new StepMissingControlsException(stepData.stepId, stepData);
    }

    return await this.prepareAndValidateContentUsecase.execute({
      stepType: stepData.type,
      controlValues: dto.controlValues || stepData.controls.values,
      controlDataSchema: stepData.controls.dataSchema,
      variableSchema: stepData.variables,
      previewPayloadFromDto: dto.previewPayload,
      user,
    });
  }

  private normalizeExampleVariables(
    validatedContent: ValidatedContentResponse,
    origin?: WorkflowOriginEnum,
    payloadSchema?: JSONSchemaDto
  ) {
    if (origin === WorkflowOriginEnum.EXTERNAL && payloadSchema) {
      const payloadVariableExample = { payload: this.generatePayloadVariableExample(payloadSchema) };

      return mergeObjects(payloadVariableExample, validatedContent.finalPayload as Record<string, unknown>);
    }

    return validatedContent.finalPayload;
  }

  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      stepId: command.stepDatabaseId,
      user: command.user,
    });
  }
  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }
  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    updatedControlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);
    try {
      return await this.legacyPreviewStepUseCase.execute(
        PreviewStepCommand.create({
          payload: hydratedPayload.payload || {},
          subscriber: hydratedPayload.subscriber,
          controls: updatedControlValues || {},
          environmentId: command.user.environmentId,
          organizationId: command.user.organizationId,
          stepId: stepData.stepId,
          userId: command.user._id,
          workflowId: stepData.workflowId,
          workflowOrigin: stepData.origin,
          state,
        })
      );
    } catch (error) {
      if (this.isFrameworkError(error)) {
        throw new GeneratePreviewError(error);
      } else {
        throw error;
      }
    }
  }
}

function buildState(steps: Record<string, unknown> | undefined): FrameworkPreviousStepsOutputState[] {
  const outputArray: FrameworkPreviousStepsOutputState[] = [];
  for (const [stepId, value] of Object.entries(steps || {})) {
    outputArray.push({
      stepId,
      outputs: value as Record<string, unknown>,
      state: {
        status: JobStatusEnum.COMPLETED,
      },
    });
  }

  return outputArray;
}
export class GeneratePreviewError extends InternalServerErrorException {
  constructor(error: FrameworkError) {
    super({
      message: `GeneratePreviewError: Original Message:`,
      frameworkMessage: error.response.message,
      code: error.response.code,
      data: error.response.data,
    });
  }
}

class FrameworkError {
  response: {
    message: string;
    code: string;
    data: unknown;
  };
  status: number;
  options: Record<string, unknown>;
  message: string;
  name: string;
}
