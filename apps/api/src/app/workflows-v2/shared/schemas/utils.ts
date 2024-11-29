import { z } from 'zod';

export function getSchemaDefaults<T extends z.ZodType>(schema: T): Partial<z.infer<T>> {
  if (schema instanceof z.ZodObject) {
    const defaults: Record<string, unknown> = {};

    Object.entries(schema.shape).forEach(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        defaults[key] = value._def.defaultValue();
      } else if (value instanceof z.ZodObject) {
        // schema is nested
        const nestedDefaults = getSchemaDefaults(value);
        if (Object.keys(nestedDefaults).length > 0) {
          defaults[key] = nestedDefaults;
        }
      }
    });

    return defaults;
  }

  return {};
}
