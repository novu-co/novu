import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
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
import { BuildPayloadSchemaCommand } from '../build-payload-schema/build-payload-schema.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import { Variable } from '../../util/template-parser/liquid-parser';
import { pathsToObject } from '../../util/path-to-object';
import { isObjectTipTapNode } from '../../util/tip-tap.util';
import { buildVariables } from '../../util/build-variables';
import { sanitizeControlValues } from '../../shared/sanitize-control-values';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private previewStepUsecase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildPayloadSchema: BuildPayloadSchema,
    private readonly logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    try {
      const {
        stepData,
        controlValues: initialControlValues,
        variableSchema,
        workflow,
      } = await this.initializePreviewContext(command);
      const commandVariablesExample = command.generatePreviewRequestDto.previewPayload;
      const sanitizedValidatedControls = sanitizeControlValues(initialControlValues, stepData.type);

      if (!sanitizedValidatedControls) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed: The normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      let previewTemplateData = {
        variablesExample: {},
        controlValues: {},
      };

      for (const [controlKey, controlValue] of Object.entries(sanitizedValidatedControls)) {
        const variables = buildVariables(variableSchema, controlValue, this.logger);
        const processedControlValues = this.fixControlValueInvalidVariables(controlValue, variables.invalidVariables);

        const validVariableNames = variables.validVariables.map((variable) => variable.name);
        const variablesExampleResult = pathsToObject(validVariableNames, {
          valuePrefix: '{{',
          valueSuffix: '}}',
        });

        previewTemplateData = {
          variablesExample: _.merge(previewTemplateData.variablesExample, variablesExampleResult),
          controlValues: {
            ...previewTemplateData.controlValues,
            [controlKey]: isObjectTipTapNode(processedControlValues)
              ? JSON.stringify(processedControlValues)
              : processedControlValues,
          },
        };
      }

      const mergedVariablesExample = this.mergeVariablesExample(workflow, previewTemplateData, commandVariablesExample);
      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        mergedVariablesExample,
        previewTemplateData.controlValues
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: mergedVariablesExample,
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

  private mergeVariablesExample(
    workflow: WorkflowInternalResponseDto,
    previewTemplateData: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined
  ) {
    let finalVariablesExample = {};
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      // if external workflow, we need to override with stored payload schema
      const tmp = createMockObjectFromSchema({
        type: 'object',
        properties: { payload: workflow.payloadSchema },
      });
      finalVariablesExample = { ...previewTemplateData.variablesExample, ...tmp };
    } else {
      finalVariablesExample = previewTemplateData.variablesExample;
    }

    finalVariablesExample = _.merge(finalVariablesExample, commandVariablesExample || {});

    return finalVariablesExample;
  }

  private async initializePreviewContext(command: GeneratePreviewCommand) {
    const stepData = await this.getStepData(command);
    const controlValues = command.generatePreviewRequestDto.controlValues || stepData.controls.values || {};
    const workflow = await this.findWorkflow(command);
    const variableSchema = await this.buildVariablesSchema(stepData.variables, command, controlValues);

    return { stepData, controlValues, variableSchema, workflow };
  }

  @Instrument()
  private async buildVariablesSchema(
    variables: Record<string, unknown>,
    command: GeneratePreviewCommand,
    controlValues: Record<string, unknown>
  ) {
    const payloadSchema = await this.buildPayloadSchema.execute(
      BuildPayloadSchemaCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        workflowId: command.workflowIdOrInternalId,
        controlValues,
      })
    );

    if (Object.keys(payloadSchema).length === 0) {
      return variables;
    }

    return _.merge(variables, { properties: { payload: payloadSchema } });
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
      return await this.previewStepUsecase.execute(
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

  private fixControlValueInvalidVariables(
    controlValues: unknown,
    invalidVariables: Variable[]
  ): Record<string, unknown> {
    try {
      let controlValuesString = JSON.stringify(controlValues);

      for (const invalidVariable of invalidVariables) {
        if (!controlValuesString.includes(invalidVariable.output)) {
          continue;
        }

        const EMPTY_STRING = '';
        controlValuesString = replaceAll(controlValuesString, invalidVariable.output, EMPTY_STRING);
      }

      return JSON.parse(controlValuesString) as Record<string, unknown>;
    } catch (error) {
      return controlValues as Record<string, unknown>;
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

/**
 * Replaces all occurrences of a search string with a replacement string.
 */
export function replaceAll(text: string, searchValue: string, replaceValue: string): string {
  return _.replace(text, new RegExp(_.escapeRegExp(searchValue), 'g'), replaceValue);
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
