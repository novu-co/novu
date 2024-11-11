import { JSONSchemaDto } from '@novu/shared';

/**
 * Builds a JSON schema object where each variable becomes a string property.
 */
export function buildJSONSchema(variables: Record<string, unknown>): JSONSchemaDto {
  const properties: Record<string, JSONSchemaDto> = {};

  for (const [variableKey, variableValue] of Object.entries(variables)) {
    properties[variableKey] = {
      type: 'string',
      default: variableValue,
    };
  }

  return {
    type: 'object',
    properties,
  };
}
