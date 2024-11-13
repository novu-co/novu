import { JSONSchemaDto } from '@novu/shared';

export function convertJsonToSchemaWithDefaults(unknownObject?: Record<string, unknown>) {
  if (!unknownObject) {
    return {};
  }

  return generateJsonSchema(unknownObject) as unknown as JSONSchemaDto;
}

function isAJsonSchemaDto(schema: JSONSchemaDto | boolean): schema is JSONSchemaDto {
  return typeof schema !== 'boolean';
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

export { generateJsonSchema, JSONSchemaDto };
