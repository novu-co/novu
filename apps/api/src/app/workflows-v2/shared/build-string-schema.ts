import { JSONSchema } from 'json-schema-to-ts';

/**
 * Builds a JSON schema object where each variable becomes a string property.
 */
export function buildJSONSchema(variables: Record<string, unknown>): JSONSchema {
  const properties: Record<string, JSONSchema> = {};

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
