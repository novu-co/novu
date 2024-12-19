import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  PreviewPayload,
  StepDataDto,
  TipTapNode,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
  Instrument,
  InstrumentUsecase,
  PinoLogger,
  sanitizePreviewControlValues,
} from '@novu/application-generic';
import { captureException } from '@sentry/node';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { BuildPayloadSchemaCommand } from '../build-payload-schema/build-payload-schema.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import {
  extractLiquidTemplateVariables,
  TemplateParseResult,
  Variable,
} from '../../util/template-parser/liquid-parser';
import { pathsToObject } from '../../util/path-to-object';
import { transformMailyContentToLiquid } from './transform-maily-content-to-liquid';
import { isObjectTipTapNode, isStringTipTapNode } from '../../util/tip-tap.util';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

type DestructuredControlValues = {
  tiptapControlValues: { emailEditor?: string | null; body?: string | null } | null;
  // this is the remaining control values after the tiptap control is extracted
  simpleControlValues: Record<string, unknown>;
};

type ProcessedControlResult = {
  controlValues: Record<string, unknown>;
  variablesExample: Record<string, unknown> | null;
};

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private previewStepUsecase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private readonly logger: PinoLogger,
    private buildPayloadSchema: BuildPayloadSchema
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
      const sanitizedValidatedControls = sanitizePreviewControlValues(initialControlValues, stepData.type);

      if (!sanitizedValidatedControls) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed: The normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      let previewDataResult = {
        variablesExample: {},
        controlValues: {},
      };

      for (const [controlKey, controlValue] of Object.entries(sanitizedValidatedControls)) {
        // previewControlValue is the control value that will be used to render the preview
        const previewControlValue = controlValue;
        // variableControlValue is the control value that will be used to extract the variables example
        let variableControlValue = controlValue;
        if (isStringTipTapNode(variableControlValue)) {
          try {
            variableControlValue = transformMailyContentToLiquid(JSON.parse(variableControlValue));
          } catch (error) {
            console.log(error);
          }
        }

        const variables = this.processControlValueVariables(variableControlValue, variableSchema);
        const processedControlValues = this.fixControlValueInvalidVariables(previewControlValue, variables.invalid);

        const validVariableNames = variables.valid.map((variable) => variable.name);
        const variablesExampleResult = pathsToObject(validVariableNames, {
          valuePrefix: '{{',
          valueSuffix: '}}',
        });

        previewDataResult = {
          variablesExample: _.merge(previewDataResult.variablesExample, variablesExampleResult),
          controlValues: {
            ...previewDataResult.controlValues,
            [controlKey]: isObjectTipTapNode(processedControlValues)
              ? JSON.stringify(processedControlValues)
              : processedControlValues,
          },
        };
      }

      const finalVariablesExample = this.buildVariable(workflow, previewDataResult, commandVariablesExample);
      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        finalVariablesExample,
        previewDataResult.controlValues
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: finalVariablesExample,
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

  private buildVariable(
    workflow: WorkflowInternalResponseDto,
    previewDataResult: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined
  ) {
    let finalVariablesExample = {};
    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      // if external workflow, we need to override with stored payload schema
      const tmp = createMockObjectFromSchema({
        type: 'object',
        properties: { payload: workflow.payloadSchema },
      });
      finalVariablesExample = { ...previewDataResult.variablesExample, ...tmp };
    } else {
      finalVariablesExample = previewDataResult.variablesExample;
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

  private processControlValueVariables(
    controlValue: unknown,
    variableSchema: Record<string, unknown>
  ): {
    valid: Variable[];
    invalid: Variable[];
  } {
    const { validVariables, invalidVariables } = extractLiquidTemplateVariables(JSON.stringify(controlValue));

    const { validVariables: validSchemaVariables, invalidVariables: invalidSchemaVariables } = identifyUnknownVariables(
      variableSchema,
      validVariables
    );

    return {
      valid: validSchemaVariables,
      invalid: [...invalidVariables, ...invalidSchemaVariables],
    };
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
        if (!controlValuesString.includes(invalidVariable.template)) {
          continue;
        }

        const EMPTY_STRING = '';
        controlValuesString = replaceAll(controlValuesString, invalidVariable.template, EMPTY_STRING);
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

/**
 * Validates liquid template variables against a schema, the result is an object with valid and invalid variables
 * @example
 * const variables = [
 *   { name: 'subscriber.firstName' },
 *   { name: 'subscriber.orderId' }
 * ];
 * const schema = {
 *   properties: {
 *     subscriber: {
 *       properties: {
 *         firstName: { type: 'string' }
 *       }
 *     }
 *   }
 * };
 * const invalid = [{ name: 'unknown.variable' }];
 *
 * validateVariablesAgainstSchema(variables, schema, invalid);
 * // Returns:
 * // {
 * //   validVariables: [{ name: 'subscriber.firstName' }],
 * //   invalidVariables: [{ name: 'unknown.variable' }, { name: 'subscriber.orderId' }]
 * // }
 */
function identifyUnknownVariables(
  variableSchema: Record<string, unknown>,
  validVariables: Variable[]
): TemplateParseResult {
  const validVariablesCopy: Variable[] = _.cloneDeep(validVariables);

  const result = validVariablesCopy.reduce<TemplateParseResult>(
    (acc, variable: Variable) => {
      const parts = variable.name.split('.');
      let isValid = true;
      let currentPath = 'properties';

      for (const part of parts) {
        currentPath += `.${part}`;
        const valueSearch = _.get(variableSchema, currentPath);

        currentPath += '.properties';
        const propertiesSearch = _.get(variableSchema, currentPath);

        if (valueSearch === undefined && propertiesSearch === undefined) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        acc.validVariables.push(variable);
      } else {
        acc.invalidVariables.push({
          name: variable.template,
          context: variable.context,
          message: 'Variable is not supported',
          template: variable.template,
        });
      }

      return acc;
    },
    {
      validVariables: [] as Variable[],
      invalidVariables: [] as Variable[],
    } as TemplateParseResult
  );

  return result;
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
function replaceAll(text: string, searchValue: string, replaceValue: string): string {
  return _.replace(text, new RegExp(_.escapeRegExp(searchValue), 'g'), replaceValue);
}
