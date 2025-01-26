import {
  WorkflowOriginEnum,
  PreviewPayload,
  StepResponseDto,
  createMockObjectFromSchema,
  StepTypeEnum,
} from '@novu/shared';
import { PinoLogger, WorkflowInternalResponseDto, dashboardSanitizeControlValues } from '@novu/application-generic';
import _ from 'lodash';

import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { channelStepSchemas, actionStepSchemas } from '@novu/framework/internal';
import { JSONContent as MailyJSONContent } from '@maily-to/render';
import { mergeCommonObjectKeys } from '../../../util/utils';

export type PreviewStrategy = {
  sanitizeControlValues: (
    initialControlValues: Record<string, unknown>,
    stepData: StepResponseDto
  ) => Record<string, unknown>;

  mergeVariablesExample: (
    workflow: WorkflowInternalResponseDto,
    previewTemplateData: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined
  ) => Record<string, unknown>;
};

export function createNovuCloudPreviewStrategy(logger: PinoLogger): PreviewStrategy {
  return {
    sanitizeControlValues: (initialControlValues: Record<string, unknown>, stepData: StepResponseDto) => {
      const sanitizedValues = dashboardSanitizeControlValues(logger, initialControlValues, stepData.type);

      const sanitizedValidatedControls = sanitizeControlValuesByOutputSchema(sanitizedValues || {}, stepData.type);

      if (!sanitizedValidatedControls) {
        throw new Error(
          // eslint-disable-next-line max-len
          'Control values normalization failed, normalizeControlValues function requires maintenance to sanitize the provided type or data structure correctly'
        );
      }

      return sanitizedValidatedControls;
    },

    mergeVariablesExample: (
      workflow: WorkflowInternalResponseDto,
      previewTemplateData: { variablesExample: {}; controlValues: {} },
      commandVariablesExample: PreviewPayload | undefined
    ) => {
      let { variablesExample } = previewTemplateData;

      if (commandVariablesExample && Object.keys(commandVariablesExample).length > 0) {
        variablesExample = mergeCommonObjectKeys(
          variablesExample as Record<string, unknown>,
          commandVariablesExample as Record<string, unknown>
        );
      }

      return variablesExample;
    },
  };
}

export function createExternalPreviewStrategy(): PreviewStrategy {
  return {
    /**
     * External workflows handle their own control value validation and sanitization
     * since they are defined programmatically rather than through the dashboard
     */
    sanitizeControlValues: (initialControlValues: Record<string, unknown>, stepData: StepResponseDto) => {
      return initialControlValues;
    },

    /**
     * Overrides template data with stored schema to match external workflow structure
     */
    mergeVariablesExample: (
      workflow: WorkflowInternalResponseDto,
      previewTemplateData: { variablesExample: {}; controlValues: {} },
      commandVariablesExample: PreviewPayload | undefined
    ) => {
      let { variablesExample } = previewTemplateData;

      // if external workflow, we need to override with stored payload schema
      const schemaBasedVariables = createMockObjectFromSchema({
        type: 'object',
        properties: { payload: workflow.payloadSchema },
      });
      variablesExample = _.merge(variablesExample, schemaBasedVariables);

      if (commandVariablesExample && Object.keys(commandVariablesExample).length > 0) {
        // merge only values of common keys between variablesExample and commandVariablesExample
        variablesExample = mergeCommonObjectKeys(
          variablesExample as Record<string, unknown>,
          commandVariablesExample as Record<string, unknown>
        );
      }

      return variablesExample;
    },
  };
}

export function createPreviewStrategy(origin: WorkflowOriginEnum, logger: PinoLogger): PreviewStrategy {
  switch (origin) {
    case WorkflowOriginEnum.NOVU_CLOUD:
    case WorkflowOriginEnum.NOVU_CLOUD_V1:
      return createNovuCloudPreviewStrategy(logger);
    case WorkflowOriginEnum.EXTERNAL:
      return createExternalPreviewStrategy();
    default:
      throw new Error(`Unsupported workflow origin: ${origin}`);
  }
}

export function sanitizeControlValuesByOutputSchema(
  controlValues: Record<string, unknown>,
  type: StepTypeEnum
): Record<string, unknown> {
  const outputSchema = channelStepSchemas[type]?.output || actionStepSchemas[type]?.output;

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

function replaceInvalidControlValues(
  normalizedControlValues: Record<string, unknown>,
  errors: ErrorObject[]
): Record<string, unknown> {
  const fixedValues = _.cloneDeep(normalizedControlValues);

  for (const error of errors) {
    /*
     *  we allow additional properties in control values compare to output
     *  such as skip and disableOutputSanitization
     */
    if (error.keyword === 'additionalProperties') {
      continue;
    }

    const path = getErrorPath(error);
    const defaultValue = _.get(previewControlValueDefault, path);
    _.set(fixedValues, path, defaultValue);
  }

  return fixedValues;
}

function getErrorPath(error: ErrorObject): string {
  return (error.instancePath.substring(1) || error.params.missingProperty).replace(/\//g, '.');
}

const EMPTY_STRING = '';
const WHITESPACE = ' ';
const DEFAULT_URL_TARGET = '_blank';
const DEFAULT_URL_PATH = 'https://www.redirect-example.com';
const DEFAULT_TIP_TAP_EMPTY_PREVIEW: MailyJSONContent = {
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
