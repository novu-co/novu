import _ from 'lodash';

import { PinoLogger } from '@novu/application-generic';

import { Variable, extractLiquidTemplateVariables, TemplateVariables } from './template-parser/liquid-parser';
import { transformMailyContentToLiquid } from '../usecases/generate-preview/transform-maily-content-to-liquid';
import { isStringTipTapNode } from './tip-tap.util';

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

/**
 * Validates variables against a schema to identify which ones are valid/invalid.
 * Returns an object containing arrays of valid and invalid variables.
 */
function identifyUnknownVariables(
  variableSchema: Record<string, unknown>,
  validVariables: Variable[]
): TemplateVariables {
  const validVariablesCopy: Variable[] = _.cloneDeep(validVariables);

  const result = validVariablesCopy.reduce<TemplateVariables>(
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
          name: variable.output,
          context: variable.context,
          message: 'Variable is not supported',
          output: variable.output,
        });
      }

      return acc;
    },
    {
      validVariables: [] as Variable[],
      invalidVariables: [] as Variable[],
    } as TemplateVariables
  );

  return result;
}
