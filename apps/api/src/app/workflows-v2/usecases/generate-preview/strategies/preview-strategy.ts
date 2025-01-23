import { WorkflowOriginEnum, PreviewPayload, StepResponseDto, createMockObjectFromSchema } from '@novu/shared';
import { PinoLogger, WorkflowInternalResponseDto, dashboardSanitizeControlValues } from '@novu/application-generic';
import _ from 'lodash';

import { sanitizeControlValuesByOutputSchema } from '../utils/sanitize-control-values-by-output';
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
