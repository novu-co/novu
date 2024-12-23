import { JSONSchemaDefinition, JSONSchemaDto } from '@novu/shared';

export function emptyJsonSchema(): JSONSchemaDto {
  return {
    type: 'object',
    properties: {},
    additionalProperties: true,
  };
}

export function convertJsonToSchemaWithDefaults(unknownObject?: Record<string, unknown>) {
  if (!unknownObject) {
    return {};
  }

  return generateJsonSchema(unknownObject) as unknown as JSONSchemaDto;
}

function generateJsonSchema(jsonObject: Record<string, unknown>): JSONSchemaDto {
  const schema: JSONSchemaDto = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const [key, value] of Object.entries(jsonObject)) {
    if (schema.properties && schema.required) {
      schema.properties[key] = determineSchemaType(value);
      schema.required.push(key);
    }
  }

  return schema;
}

function determineSchemaType(value: unknown): JSONSchemaDto {
  if (value === null) {
    return { type: 'null' };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length > 0 ? determineSchemaType(value[0]) : { type: 'null' },
    };
  }

  switch (typeof value) {
    case 'string':
      return { type: 'string', default: value };
    case 'number':
      return { type: 'number', default: value };
    case 'boolean':
      return { type: 'boolean', default: value };
    case 'object':
      return {
        type: 'object',
        properties: Object.entries(value).reduce(
          (acc, [key, val]) => {
            acc[key] = determineSchemaType(val);

            return acc;
          },
          {} as { [key: string]: JSONSchemaDto }
        ),
        required: Object.keys(value),
      };

    default:
      return { type: 'null' };
  }
}

function isMatchingJsonSchema(schema: JSONSchemaDefinition, obj?: Record<string, unknown> | null): boolean {
  // Ensure the schema is an object with properties
  if (!obj || !schema || typeof schema !== 'object' || schema.type !== 'object' || !schema.properties) {
    return false; // If schema is not structured or no properties are defined, assume match
  }

  // Get the required fields from the schema
  const requiredFields = schema.required ?? [];

  // Check if all required fields are present in the object
  const allRequiredFieldsPresent = requiredFields.every((field) => field in obj);

  if (!allRequiredFieldsPresent) return false;

  // Recursively check required fields for nested objects
  for (const field of requiredFields) {
    const fieldSchema = schema.properties[field];
    const fieldValue = obj[field] as Record<string, unknown> | undefined;

    if (typeof fieldSchema === 'object' && fieldSchema.type === 'object' && fieldSchema.properties) {
      // If a required field is an object, validate its nested structure
      if (!isMatchingJsonSchema(fieldSchema, fieldValue ?? {})) {
        return false;
      }
    }
  }

  return true;
}

function extractMinValuesFromSchema(schema: JSONSchemaDefinition): Record<string, number> {
  const result = {};

  if (typeof schema === 'object' && schema.type === 'object') {
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      if (typeof value === 'object' && value.type === 'object' && value.properties) {
        // Recursively handle nested objects
        const nestedResult = extractMinValuesFromSchema(value);
        if (Object.keys(nestedResult).length > 0) {
          result[key] = nestedResult;
        }
      } else if (typeof value === 'object' && value.minimum !== undefined) {
        // Add the minimum value if defined
        result[key] = value.minimum;
      }
    }
  }

  return result;
}

export { generateJsonSchema, isMatchingJsonSchema, extractMinValuesFromSchema, JSONSchemaDto };
