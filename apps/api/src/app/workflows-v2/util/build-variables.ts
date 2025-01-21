import _ from 'lodash';

import { MAILY_ITERABLE_MARK, PinoLogger } from '@novu/application-generic';

import { Variable, extractLiquidTemplateVariables, TemplateVariables } from './template-parser/liquid-parser';
import { isStringTipTapNode } from './tip-tap.util';
import { HydrateEmailSchemaUseCase } from '../../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';

export function buildVariables(
  variableSchema: Record<string, unknown> | undefined,
  controlValue: unknown | Record<string, unknown>,
  logger?: PinoLogger
): TemplateVariables {
  let variableControlValue = controlValue;

  if (isStringTipTapNode(variableControlValue)) {
    try {
      variableControlValue = new HydrateEmailSchemaUseCase().execute({ emailEditor: variableControlValue });
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

function isPropertyAllowed(schema: Record<string, unknown>, propertyPath: string) {
  let currentSchema = { ...schema };
  if (!currentSchema || typeof currentSchema !== 'object') {
    return false;
  }

  const pathParts = propertyPath.split('.');

  for (const part of pathParts) {
    const { properties, additionalProperties } = currentSchema;

    if (properties?.[part]) {
      currentSchema = properties[part];
      continue;
    }

    if (part === MAILY_ITERABLE_MARK && currentSchema.type === 'array') {
      currentSchema = currentSchema.items as Record<string, unknown>;
      continue;
    }

    if (additionalProperties === true) {
      return true;
    }

    return false;
  }

  return true;
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
      const isValid = isPropertyAllowed(variableSchema, variable.name);

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
