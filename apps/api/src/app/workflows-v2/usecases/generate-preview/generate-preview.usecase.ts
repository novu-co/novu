import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
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
import { HydrateEmailSchemaUseCase } from '../../../environments-v1/usecases/output-renderers';
import { PrepareAndValidateContentUsecase } from '../validate-content/prepare-and-validate-content/prepare-and-validate-content.usecase';

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
    private buildPayloadSchema: BuildPayloadSchema,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase
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

      const sanitizedValidatedControls = sanitizePreviewControlValues(initialControlValues, stepData.type);

      if (!sanitizedValidatedControls) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed: The normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      const destructuredControlValues = this.destructureControlValues(sanitizedValidatedControls);

      const { variablesExample: tiptapVariablesExample, controlValues: tiptapControlValues } =
        await this.handleTipTapControl(
          destructuredControlValues.tiptapControlValues,
          command,
          stepData,
          variableSchema
        );
      const { variablesExample: simpleVariablesExample, controlValues: simpleControlValues } = this.handleSimpleControl(
        destructuredControlValues.simpleControlValues,
        variableSchema,
        workflow,
        command.generatePreviewRequestDto.previewPayload
      );
      const previewData = {
        variablesExample: _.merge({}, tiptapVariablesExample || {}, simpleVariablesExample || {}),
        controlValues: { ...tiptapControlValues, ...simpleControlValues },
      };

      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        previewData.variablesExample,
        previewData.controlValues
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: previewData.variablesExample,
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

  private async safeAttemptToParseEmailSchema(
    tiptapControl: string,
    command: GeneratePreviewCommand,
    controlValues: Record<string, unknown>,
    controlSchema: Record<string, unknown>,
    variableSchema: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    if (typeof tiptapControl !== 'string') {
      return null;
    }

    try {
      const preparedAndValidatedContent = await this.prepareAndValidateContentUsecase.execute({
        user: command.user,
        previewPayloadFromDto: command.generatePreviewRequestDto.previewPayload,
        controlValues,
        controlDataSchema: controlSchema || {},
        variableSchema,
      });

      return preparedAndValidatedContent.finalPayload as Record<string, unknown>;
    } catch (e) {
      return null;
    }
  }

  private async handleTipTapControl(
    tiptapControlValue: {
      emailEditor?: string | null;
      body?: string | null;
    } | null,
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    variableSchema: Record<string, unknown>
  ): Promise<ProcessedControlResult> {
    if (!tiptapControlValue || (!tiptapControlValue?.emailEditor && !tiptapControlValue?.body)) {
      return {
        variablesExample: null,
        controlValues: tiptapControlValue as Record<string, unknown>,
      };
    }

    const emailVariables = await this.safeAttemptToParseEmailSchema(
      tiptapControlValue?.emailEditor || tiptapControlValue?.body || '',
      command,
      tiptapControlValue,
      stepData.controls.dataSchema || {},
      variableSchema
    );

    return {
      variablesExample: emailVariables,
      controlValues: tiptapControlValue,
    };
  }

  private handleSimpleControl(
    controlValues: Record<string, unknown>,
    variableSchema: Record<string, unknown>,
    workflow: WorkflowInternalResponseDto,
    commandVariablesExample: PreviewPayload | undefined
  ): ProcessedControlResult {
    const variables = this.processControlValueVariables(controlValues, variableSchema);
    const processedControlValues = this.fixControlValueInvalidVariables(controlValues, variables.invalid);
    const extractedTemplateVariables = variables.valid.map((variable) => variable.name);
    const payloadVariableExample =
      workflow.origin === WorkflowOriginEnum.EXTERNAL
        ? createMockObjectFromSchema({
            type: 'object',
            properties: { payload: workflow.payloadSchema },
          })
        : {};

    if (extractedTemplateVariables.length === 0) {
      return {
        variablesExample: payloadVariableExample,
        controlValues: processedControlValues,
      };
    }

    const variablesExample: Record<string, unknown> = pathsToObject(extractedTemplateVariables, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    });

    const variablesExampleForPreview = _.merge(variablesExample, payloadVariableExample, commandVariablesExample || {});

    return {
      variablesExample: variablesExampleForPreview,
      controlValues: processedControlValues,
    };
  }

  private async initializePreviewContext(command: GeneratePreviewCommand) {
    const stepData = await this.getStepData(command);
    const controlValues = command.generatePreviewRequestDto.controlValues || stepData.controls.values || {};
    const workflow = await this.findWorkflow(command);
    const variableSchema = await this.buildVariablesSchema(stepData.variables, command, controlValues);

    return { stepData, controlValues, variableSchema, workflow };
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

  private destructureControlValues(controlValues: Record<string, unknown>): DestructuredControlValues {
    try {
      const localControlValue = _.cloneDeep(controlValues);
      let tiptapControlString: string | null = null;

      if (isTipTapNode(localControlValue.emailEditor)) {
        tiptapControlString = localControlValue.emailEditor;
        delete localControlValue.emailEditor;

        return { tiptapControlValues: { emailEditor: tiptapControlString }, simpleControlValues: localControlValue };
      }

      if (isTipTapNode(localControlValue.body)) {
        tiptapControlString = localControlValue.body;
        delete localControlValue.body;

        return { tiptapControlValues: { body: tiptapControlString }, simpleControlValues: localControlValue };
      }

      return { tiptapControlValues: null, simpleControlValues: localControlValue };
    } catch (error) {
      this.logger.error({ error }, 'Failed to extract TipTap control', LOG_CONTEXT);

      return { tiptapControlValues: null, simpleControlValues: controlValues };
    }
  }

  private fixControlValueInvalidVariables(
    controlValues: Record<string, unknown>,
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
      return controlValues;
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
