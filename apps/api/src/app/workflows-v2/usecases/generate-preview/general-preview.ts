import { Injectable } from '@nestjs/common';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import _ from 'lodash';

import {
  createMockObjectFromSchema,
  GeneratePreviewResponseDto,
  PreviewPayload,
  StepResponseDto,
  StepTypeEnum,
  TipTapNode,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  dashboardSanitizeControlValues,
  GetWorkflowByIdsUseCase,
  PinoLogger,
  WorkflowInternalResponseDto,
} from '@novu/application-generic';
import { channelStepSchemas, actionStepSchemas } from '@novu/framework/internal';

import { PreviewStep } from '../../../bridge/usecases/preview-step';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import { BasePreviewHandler } from './base-preview';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class GeneralPreviewHandler extends BasePreviewHandler {
  constructor(
    protected previewStepUsecase: PreviewStep,
    protected buildStepDataUsecase: BuildStepDataUsecase,
    protected getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    protected buildPayloadSchema: BuildPayloadSchema,
    protected readonly logger: PinoLogger
  ) {
    super(previewStepUsecase, buildStepDataUsecase, getWorkflowByIdsUseCase, buildPayloadSchema, logger);
  }
  async preview(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    return super.preview(command);
  }

  protected sanitizeControlValues = (
    controlValues: Record<string, unknown>,
    stepData: StepResponseDto
  ): Record<string, unknown> => {
    const sanitizedValues = dashboardSanitizeControlValues(this.logger, controlValues, stepData.type);

    const sanitizedValidatedControls = sanitizeControlValuesByOutputSchema(sanitizedValues || {}, stepData.type);

    if (!sanitizedValidatedControls) {
      throw new Error(
        // eslint-disable-next-line max-len
        'Control values normalization failed, normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
      );
    }

    return sanitizedValidatedControls;
  };

  protected mergeVariablesExample(
    previewTemplateData: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined,
    workflow: WorkflowInternalResponseDto
  ) {
    return _.merge(previewTemplateData.variablesExample, commandVariablesExample || {});
  }
}

function sanitizeControlValuesByOutputSchema(
  controlValues: Record<string, unknown>,
  type: StepTypeEnum
): Record<string, unknown> {
  const outputSchema = channelStepSchemas[type].output || actionStepSchemas[type].output;

  if (!outputSchema || !controlValues) {
    return controlValues;
  }

  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(outputSchema);
  const isValid = validate(controlValues);
  const errors = validate.errors as null | ErrorObject[];

  if (isValid || !errors || errors?.length === 0) {
    return controlValues;
  }

  return replaceInvalidControlValues(controlValues, errors);
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

/*
 * Extracts the path from the error object:
 * 1. If instancePath exists, removes leading slash and converts remaining slashes to dots
 * 2. If no instancePath, uses missingProperty from error params
 * Example: "/foo/bar" becomes "foo.bar"
 */
function getErrorPath(error: ErrorObject): string {
  return (error.instancePath.substring(1) || error.params.missingProperty).replace(/\//g, '.');
}

const EMPTY_STRING = '';
const WHITESPACE = ' ';
const DEFAULT_URL_TARGET = '_blank';
const DEFAULT_URL_PATH = 'https://www.redirect-example.com';
const DEFAULT_TIP_TAP_EMPTY_PREVIEW: TipTapNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: {
        textAlign: 'left',
      },
      content: [
        {
          type: 'text',
          text: EMPTY_STRING,
        },
      ],
    },
  ],
};

/**
 * Default control values used specifically for preview purposes.
 * These values are designed to be parsable by Liquid.js and provide
 * safe fallback values when generating preview.
 */
export const previewControlValueDefault = {
  subject: EMPTY_STRING,
  body: WHITESPACE,
  avatar: DEFAULT_URL_PATH,
  emailEditor: DEFAULT_TIP_TAP_EMPTY_PREVIEW,
  data: {},
  'primaryAction.label': EMPTY_STRING,
  'primaryAction.redirect.url': DEFAULT_URL_PATH,
  'primaryAction.redirect.target': DEFAULT_URL_TARGET,
  'secondaryAction.label': EMPTY_STRING,
  'secondaryAction.redirect.url': DEFAULT_URL_PATH,
  'secondaryAction.redirect.target': DEFAULT_URL_TARGET,
  'redirect.url': DEFAULT_URL_PATH,
  'redirect.target': DEFAULT_URL_TARGET,
} as const;
