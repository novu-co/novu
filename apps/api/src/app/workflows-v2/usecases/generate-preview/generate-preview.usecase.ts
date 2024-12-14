import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import { ErrorObject } from 'ajv';
import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
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
  normalizeControlValues,
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
import { flattenObjectValues } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';
import { HydrateEmailSchemaUseCase } from '../../../environments-v1/usecases/output-renderers';

const LOG_CONTEXT = 'GeneratePreviewUsecase';
const INVALID_VARIABLE_PLACEHOLDER = '<INVALID_VARIABLE_PLACEHOLDER>';
const PREVIEW_ERROR_MESSAGE_PLACEHOLDER = `[[Invalid Variable: ${INVALID_VARIABLE_PLACEHOLDER}]]`;

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private readonly logger: PinoLogger,
    private buildPayloadSchema: BuildPayloadSchema,
    private hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase
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

      const typeValidatedControls = normalizeControlValues(initialControlValues, stepData.type);

      if (!typeValidatedControls) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed: The normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      const { tiptapControlString, controlValues } = this.mapControlValues(typeValidatedControls);

      let emailVariables: Record<string, unknown> | null = null;
      if (tiptapControlString) {
        // to do add to variablesExampleForPreview
        emailVariables = this.safeAttemptToParseEmailSchema(tiptapControlString);
      }

      const variables = this.processControlValueVariables(controlValues, variableSchema);

      const controlValueForPreview = this.fixControlValueInvalidVariables(controlValues, variables.invalid);

      const variablesExampleForPreview = this.buildVariableExample(
        controlValueForPreview,
        workflow,
        command.generatePreviewRequestDto.previewPayload
      );

      const unitedVariables = {
        ...variablesExampleForPreview,
        ...emailVariables,
      };
      const unitedControlValues = {
        ...controlValueForPreview,
        ...(tiptapControlString ? { emailEditor: tiptapControlString } : {}),
      };

      const executeOutput = await this.executePreviewUsecase(command, stepData, unitedVariables, unitedControlValues);

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: variablesExampleForPreview,
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

  private safeAttemptToParseEmailSchema(tiptapControl: string): Record<string, unknown> | null {
    if (typeof tiptapControl !== 'string') {
      return null;
    }

    try {
      const { placeholderAggregation } = this.hydrateEmailSchemaUseCase.execute({
        emailEditor: tiptapControl,
        fullPayloadForRender: {
          payload: {},
          subscriber: {},
          steps: {},
        },
      });

      return {
        ...placeholderAggregation.nestedForPlaceholders,
        ...placeholderAggregation.regularPlaceholdersToDefaultValue,
      };
    } catch (e) {
      return null;
    }
  }

  private async initializePreviewContext(command: GeneratePreviewCommand) {
    const stepData = await this.getStepData(command);
    const controlValues = command.generatePreviewRequestDto.controlValues || stepData.controls.values || {};
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

    return { stepData, controlValues, variableSchema, workflow };
  }

  private buildVariableExample(
    controlValueForPreview: Record<string, unknown>,
    workflow: WorkflowInternalResponseDto,
    commandVariablesExample: PreviewPayload | undefined
  ) {
    const templateVars = this.extractTemplateVariables([controlValueForPreview]);

    if (templateVars.length === 0) {
      return {} as Record<string, unknown>;
    }

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    });

    const variablesExampleForPreview = this.buildVariablesExample(workflow, variablesExample, commandVariablesExample);

    return variablesExampleForPreview;
  }

  private processControlValueVariables(
    controlValues: Record<string, unknown>,
    variableSchema: Record<string, unknown>
  ): {
    valid: Variable[];
    invalid: Variable[];
  } {
    const { validVariables, invalidVariables } = extractLiquidTemplateVariables(JSON.stringify(controlValues));

    const { validVariables: validSchemaVariables, invalidVariables: invalidSchemaVariables } = identifyUnknownVariables(
      variableSchema,
      validVariables
    );

    const resultVariables = {
      valid: validSchemaVariables,
      invalid: [...invalidVariables, ...invalidSchemaVariables],
    };

    return resultVariables;
  }

  @Instrument()
  private extractTemplateVariables(controlValues: Record<string, unknown>[]): string[] {
    const controlValuesString = controlValues.map(flattenObjectValues).flat().join(' ');

    const test = extractLiquidTemplateVariables(controlValuesString);
    const test2 = test.validVariables.map((variable) => variable.name);

    return test2;
  }

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
  ): Record<string, unknown> {
    if (workflow.origin !== WorkflowOriginEnum.EXTERNAL) {
      return finalPayload as Record<string, unknown>;
    }

    const examplePayloadSchema = createMockObjectFromSchema({
      type: 'object',
      properties: { payload: workflow.payloadSchema },
    });

    if (!examplePayloadSchema || Object.keys(examplePayloadSchema).length === 0) {
      return finalPayload as Record<string, unknown>;
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

  private fixControlValueInvalidVariables(
    controlValues: Record<string, unknown>,
    invalidVariables: Variable[]
  ): Record<string, unknown> {
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
      const EMPTY_STRING = '';
      const invalidVariableExpression = invalidVariable.template
        .replace('{{', EMPTY_STRING)
        .replace('}}', EMPTY_STRING);
      const liquidJsParsableString = PREVIEW_ERROR_MESSAGE_PLACEHOLDER.replace(
        INVALID_VARIABLE_PLACEHOLDER,
        invalidVariableExpression
      );

      controlValuesString = replaceAll(controlValuesString, invalidVariable.template, liquidJsParsableString);
    }

    return JSON.parse(controlValuesString) as Record<string, unknown>;
  }

  private mapControlValues(controlValues: Record<string, unknown>): {
    tiptapControlString: string | null;
    controlValues: Record<string, unknown>;
  } {
    const resultControlValues = _.cloneDeep(controlValues);
    let tiptapControlString: string | null = null;

    if (isTipTapNode(resultControlValues.emailEditor)) {
      tiptapControlString = resultControlValues.emailEditor;
      delete resultControlValues.emailEditor;
    } else if (isTipTapNode(resultControlValues.body)) {
      tiptapControlString = resultControlValues.body;
      delete resultControlValues.body;
    }

    return { tiptapControlString, controlValues: resultControlValues };
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

/*
 * Extracts the path from the error object:
 * 1. If instancePath exists, removes leading slash and converts remaining slashes to dots
 * 2. If no instancePath, uses missingProperty from error params
 * Example: "/foo/bar" becomes "foo.bar"
 */
function getErrorPath(error: ErrorObject): string {
  return (error.instancePath.substring(1) || error.params.missingProperty).replace(/\//g, '.');
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
  // Create deep copies of input arrays to prevent side effects
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

/**
 *
 * @param value minimal tiptap object from the client is
 * {
 *  "type": "doc",
 *  "content": [
 *    {
 *      "type": "paragraph",
 *      "attrs": {
 *        "textAlign": "left"
 *      },
 *      "content": [
 *        {
 *          "type": "text",
 *          "text": " "
 *        }
 *      ]
 *  }
 *]
 *}
 */

export function isTipTapNode(value: unknown): value is string {
  let localValue = value;
  if (typeof localValue === 'string') {
    try {
      localValue = JSON.parse(localValue);
    } catch {
      return false;
    }
  }

  if (!localValue || typeof localValue !== 'object') return false;

  const doc = localValue as TipTapNode;

  // TODO check if validate type === doc is enough
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) return false;

  return true;

  /*
   * TODO check we need to validate the content
   * return doc.content.every((node) => isValidTipTapContent(node));
   */
}

function isValidTipTapContent(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  const content = node as TipTapNode;
  if (typeof content.type !== 'string') return false;
  if (content.attrs !== undefined && (typeof content.attrs !== 'object' || content.attrs === null)) {
    return false;
  }
  if (content.text !== undefined && typeof content.text !== 'string') {
    return false;
  }
  if (content.content !== undefined) {
    if (!Array.isArray(content.content)) return false;

    return content.content.every((child) => isValidTipTapContent(child));
  }

  return true;
}
