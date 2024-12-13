import { Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import {
  ChannelTypeEnum,
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepDataDto,
  StepIssuesDto,
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
import { previewControlValueDefault } from '../../shared/preview-control-value-default';
import {
  extractLiquidTemplateVariables,
  TemplateParseResult,
  Variable,
} from '../../util/template-parser/liquid-parser';
import { flattenObjectValues } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';

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
    private buildPayloadSchema: BuildPayloadSchema
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    try {
      const { stepData, controlValues, variableSchema, workflow } = await this.initializePreviewContext(command);

      const { schemaCompliantControls } = processControlValuesBySchema(
        stepData.controls.dataSchema,
        controlValues,
        stepData
      );

      const variables = this.processControlValueVariables(schemaCompliantControls, variableSchema);

      const controlValueForPreview = this.fixControlValueInvalidVariables(schemaCompliantControls, variables.invalid);

      const variablesExampleForPreview = this.buildVariableExample(
        controlValueForPreview,
        workflow,
        command.generatePreviewRequestDto.previewPayload
      );

      const executeOutput = await this.executePreviewUsecase(
        command,
        stepData,
        variablesExampleForPreview,
        controlValueForPreview
      );

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
      // eslint-disable-next-line no-console
      console.log('No template variables found');
    }

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    });

    const variablesExampleForPreview = this.buildVariablesExample(workflow, variablesExample, commandVariablesExample);

    return variablesExampleForPreview;
  }

  private processControlValueVariables(schemaCompliantControls: Record<string, unknown>, variableSchema: any) {
    const { validVariables, invalidVariables } = extractLiquidTemplateVariables(
      JSON.stringify(schemaCompliantControls)
    );

    const { validVariables: validSchemaVariables, invalidVariables: invalidSchemaVariables } =
      validateValidVariablesAgainstSchema(variableSchema, validVariables);

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
 * Fixes invalid control values by applying default values from the schema
 *
 * @example
 * // Input:
 * const values = { foo: 'invalid' };
 * const errors = [{ instancePath: '/foo' }];
 * const defaults = { foo: 'default' };
 *
 * // Output:
 * const fixed = { foo: 'default' };
 */
function replaceInvalidControlValues(
  normalizedControlValues: Record<string, unknown>,
  errors: ErrorObject[]
): Record<string, unknown> {
  const fixedValues = _.cloneDeep(normalizedControlValues);

  errors.forEach((error) => {
    const path = getErrorPath(error);
    const defaultValue = _.get(previewControlValueDefault, path);
    _.set(fixedValues, path, defaultValue);
  });

  return fixedValues;
}

function processControlValuesBySchema(
  controlSchema: JSONSchemaDto | undefined,
  controlValues: Record<string, unknown>,
  stepData: StepDataDto
): { issues: StepIssuesDto; schemaCompliantControls: Record<string, unknown> } {
  const issues: StepIssuesDto = {};
  let fixedValues: Record<string, unknown> | undefined;

  const schemaCompliantControls = normalizeControlValues(controlValues, stepData.type);

  if (!schemaCompliantControls) {
    throw new Error(
      // eslint-disable-next-line max-len
      'Control values normalization failed: The normalizeControlValues function requires maintenance to handle the provided type or data structure correctly'
    );
  }

  /*
   * TODO: Consider if this validation is necessary since we already normalize in normalizeControlValues and,
   * we can make it more robust by adding custom parsable by liquid js values
   *
   * Current purposes:
   * 1. Validates control schema for code-first approach
   * 2. Allows adding custom validation rules
   *    Example: If emailEditor is renamed to 'body', we can validate it's valid TipTap JSON
   */
  if (controlSchema) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(controlSchema);
    const isValid = validate(schemaCompliantControls);
    const errors = validate.errors as null | ErrorObject[];

    if (!isValid && errors && errors?.length !== 0 && schemaCompliantControls) {
      fixedValues = replaceInvalidControlValues(schemaCompliantControls, errors);

      return { issues, schemaCompliantControls: fixedValues };
    }
  }

  return { issues, schemaCompliantControls };
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
function validateValidVariablesAgainstSchema(
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
