import { JSONSchemaDto } from '@novu/shared';

export function parsePayloadSchema(schema: unknown): JSONSchemaDto {
  if (typeof schema === 'string') {
    try {
      return JSON.parse(schema);
    } catch (error) {
      throw new Error(
        'Invalid payload schema: Unable to parse provided JSON string. Please ensure the string contains valid JSON syntax.'
      );
    }
  }

  if (schema && typeof schema === 'object') {
    return schema as JSONSchemaDto;
  }

  throw new Error('Invalid payload schema: Payload schema must be either a valid JSON string or an object');
}
