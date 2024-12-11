import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepDataDto,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
  Instrument,
  InstrumentUsecase,
  PinoLogger,
} from '@novu/application-generic';
import { captureException } from '@sentry/node';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { PrepareAndValidateContentUsecase } from '../validate-content/prepare-and-validate-content/prepare-and-validate-content.usecase';
import { BuildPayloadSchemaCommand } from '../build-payload-schema/build-payload-schema.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { ValidatedContentResponse } from '../validate-content';

const INVALID_VARIABLE_PLACEHOLDER = '<INVALID_VARIABLE_PLACEHOLDER>';
const PREVIEW_ERROR_MESSAGE_PLACEHOLDER = `[[Invalid Variable: ${INVALID_VARIABLE_PLACEHOLDER}]]`;
const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private readonly logger: PinoLogger,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase,
    private buildPayloadSchema: BuildPayloadSchema
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    try {
      const { previewPayload: commandVariablesExample, controlValues: commandControlValues } =
        command.generatePreviewRequestDto;
      const stepData = await this.getStepData(command);
      const controlValues = commandControlValues || stepData.controls.values || {};
      const workflow = await this.findWorkflow(command);
      const payloadSchema = await this.buildPayloadSchema.execute(
        BuildPayloadSchemaCommand.create({
          environmentId: command.user.environmentId,
          organizationId: command.user.organizationId,
          userId: command.user._id,
          workflowId: command.workflowIdOrInternalId,
          controlValues,
        })
      );

      const variableSchema = this.buildVariablesSchema(stepData.variables, payloadSchema);
      const preparedAndValidatedContent = await this.prepareAndValidateContentUsecase.execute({
        user: command.user,
        previewPayloadFromDto: commandVariablesExample,
        controlValues,
        controlDataSchema: stepData.controls.dataSchema || {},
        variableSchema,
      });
      const variablesExample = this.buildVariablesExample(
        workflow,
        preparedAndValidatedContent.finalPayload,
        commandVariablesExample
      );
      const controlValueForPreview = this.fixInvalidLiquidOutputsForPreview(
        preparedAndValidatedContent.finalControlValues
      );
      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        variablesExample,
        controlValueForPreview
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: variablesExample,
      };
    } catch (error) {
      this.logger.error(
        {
          err: error,
          workflowIdOrInternalId: command.workflowIdOrInternalId,
          stepIdOrInternalId: command.stepIdOrInternalId,
        },
        `Unexpected error while generating preview`,
        LOG_CONTEXT
      );

      if (process.env.SENTRY_DSN) {
        captureException(error);
      }

      return {
        result: {
          preview: {},
          type: undefined,
        },
        previewPayloadExample: {},
      } as any;
    }
  }

  /**
   * Fixes invalid Liquid template variables for preview by replacing them with error messages.
   *
   * @example
   * // Input controlValues:
   * { "message": "Hello {{invalid.var}}" }
   *
   * // Output:
   * { "message": "Hello [[Invalid Variable: invalid.var]]" }
   */
  private fixInvalidLiquidOutputsForPreview(controlValues: Record<string, unknown>): Record<string, unknown> {
    const res = extractLiquidTemplateVariables(JSON.stringify(controlValues));

    const { invalidVariables } = res;
    let controlValuesString = JSON.stringify(controlValues);

    for (const invalidVariable of invalidVariables) {
      const invalidVariableExists = controlValuesString.includes(invalidVariable.name);
      if (!invalidVariableExists) {
        continue;
      }

      /*
       * we need to remove the '{{' and '}}' from the invalid variable name
       * so that framework can parse it without errors
       */
      const invalidVariableExpression = invalidVariable.name.replace('{{', '').replace('}}', '');
      const invalidVariablePreviewError = PREVIEW_ERROR_MESSAGE_PLACEHOLDER.replace(
        INVALID_VARIABLE_PLACEHOLDER,
        invalidVariableExpression
      );
      controlValuesString = controlValuesString.replace(invalidVariable.name, invalidVariablePreviewError);
    }

    return JSON.parse(controlValuesString) as Record<string, unknown>;
  }

  /**
   * Merges the payload schema into the variables schema to enable proper validation
   * and sanitization of control values in the prepareAndValidateContentUsecase.
   */
  @Instrument()
  private buildVariablesSchema(variables: Record<string, unknown>, payloadSchema: JSONSchemaDto) {
    if (Object.keys(payloadSchema).length === 0) {
      return variables;
    }

    return _.merge(variables, { properties: { payload: payloadSchema } });
  }

  @Instrument()
  private buildVariablesExample(
    workflow: WorkflowInternalResponseDto,
    finalPayload?: PreviewPayload,
    commandVariablesExample?: PreviewPayload | undefined
  ) {
    if (workflow.origin !== WorkflowOriginEnum.EXTERNAL) {
      return finalPayload;
    }

    const examplePayloadSchema = createMockObjectFromSchema({
      type: 'object',
      properties: { payload: workflow.payloadSchema },
    });

    if (!examplePayloadSchema || Object.keys(examplePayloadSchema).length === 0) {
      return finalPayload;
    }

    return _.merge(finalPayload as Record<string, unknown>, examplePayloadSchema, commandVariablesExample || {});
  }

  @Instrument()
  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        workflowIdOrInternalId: command.workflowIdOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  @Instrument()
  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      workflowIdOrInternalId: command.workflowIdOrInternalId,
      stepIdOrInternalId: command.stepIdOrInternalId,
      user: command.user,
    });
  }

  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }

  @Instrument()
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
