type ParsePayloadSchemaOptions = {
  safe?: boolean;
};

export function parsePayloadSchema(
  schema: unknown,
  { safe = false }: ParsePayloadSchemaOptions = {}
): Record<string, unknown> | null {
  if (!schema) {
    return null;
  }

  if (typeof schema === 'string') {
    try {
      return JSON.parse(schema);
    } catch (error) {
      return safe ? null : throwSchemaError('Invalid JSON string provided for payload schema');
    }
  }

  if (typeof schema === 'object') {
    return schema as Record<string, unknown>;
  }

  return safe ? null : throwSchemaError('Payload schema must be either a valid JSON string or an object');
}

function throwSchemaError(message: string): never {
  throw new Error(message);
}
