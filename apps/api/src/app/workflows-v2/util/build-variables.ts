import _ from 'lodash';

import { PinoLogger } from '@novu/application-generic';

import { Variable, extractLiquidTemplateVariables, TemplateVariables } from './template-parser/liquid-parser';
import { transformMailyContentToLiquid } from '../usecases/generate-preview/transform-maily-content-to-liquid';
import { isStringTipTapNode } from './tip-tap.util';

const DOT_PROPERTIES = '.properties';
const DOT_ADDITIONAL_PROPERTIES = '.additionalProperties';

export function buildVariables(
  variableSchema: Record<string, unknown> | undefined,
  controlValue: unknown | Record<string, unknown>,
  logger?: PinoLogger
): TemplateVariables {
  let variableControlValue = controlValue;

  if (isStringTipTapNode(variableControlValue)) {
    try {
      variableControlValue = transformMailyContentToLiquid(JSON.parse(variableControlValue));
    } catch (error) {
      logger?.error(
        {
          err: error as Error,
          controlKey: 'unknown',
          message: 'Failed to transform maily content to liquid syntax',
        },
        'BuildVariables'
      );
    }
  }

  const { validVariables, invalidVariables } = extractLiquidTemplateVariables(JSON.stringify(variableControlValue));

  const { validVariables: validSchemaVariables, invalidVariables: invalidSchemaVariables } = identifyUnknownVariables(
    variableSchema || {},
    validVariables
  );

  return {
    validVariables: validSchemaVariables,
    invalidVariables: [...invalidVariables, ...invalidSchemaVariables],
  };
}

type PathValidationResult = {
  isValid: boolean;
  additionalPropertiesFound?: boolean;
};

function validateVariablePath(variableSchema: Record<string, unknown>, variableName: string): PathValidationResult {
  const parts = variableName.split('.');
  let currentPath = 'properties';

  for (const part of parts) {
    currentPath += `.${part}`;
    const valueExists = _.get(variableSchema, currentPath) !== undefined;
    const propertiesPath = `${currentPath}${DOT_PROPERTIES}`;
    const propertiesExist = _.get(variableSchema, propertiesPath) !== undefined;

    if (!valueExists && !propertiesExist) {
      const additionalPropertiesResult = checkAdditionalProperties(variableSchema, propertiesPath);
      if (additionalPropertiesResult.isValid) {
        return { isValid: true, additionalPropertiesFound: true };
      }

      return { isValid: false };
    }

    currentPath = propertiesPath;
  }

  return { isValid: true };
}

function checkAdditionalProperties(
  variableSchema: Record<string, unknown>,
  propertiesPath: string
): PathValidationResult {
  let currentPath = propertiesPath;

  while (currentPath.length > 0) {
    const additionalPropertiesPath = `${currentPath.slice(0, -DOT_PROPERTIES.length)}${DOT_ADDITIONAL_PROPERTIES}`;
    const additionalPropertiesValue = _.get(variableSchema, additionalPropertiesPath);

    if (additionalPropertiesValue !== undefined) {
      return { isValid: additionalPropertiesValue === true };
    }

    const pathParts = currentPath.split('.');
    if (pathParts.length <= 2) break;

    currentPath = pathParts.slice(0, -2).join('.');
  }

  return { isValid: false };
}

function createInvalidVariable(variable: Variable): Variable {
  return {
    name: variable.output,
    context: variable.context,
    message: 'Variable is not supported',
    output: variable.output,
  };
}

function identifyUnknownVariables(
  variableSchema: Record<string, unknown>,
  validVariables: Variable[]
): TemplateVariables {
  const variables = _.cloneDeep(validVariables);

  return variables.reduce<TemplateVariables>(
    (acc, variable) => {
      const { isValid } = validateVariablePath(variableSchema, variable.name);

      if (isValid) {
        acc.validVariables.push(variable);
      } else {
        acc.invalidVariables.push(createInvalidVariable(variable));
      }

      return acc;
    },
    { validVariables: [], invalidVariables: [] }
  );
}
