import * as z from 'zod';
import { JSONSchemaDefinition, JSONSchemaDto, UiSchema } from '@novu/shared';
import { capitalize } from './string';

type ZodValue =
  | z.AnyZodObject
  | z.ZodString
  | z.ZodNumber
  | z.ZodNullable<z.ZodTypeAny>
  | z.ZodEffects<z.ZodTypeAny>
  | z.ZodDefault<z.ZodTypeAny>
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodBoolean
  | z.ZodAny;

const handleStringFormat = ({ value, key, format }: { value: z.ZodString; key: string; format: string }) => {
  if (format === 'email') {
    return value.email();
  } else if (format === 'uri') {
    return value
      .transform((val) => (val === '' ? undefined : val))
      .refine((val) => !val || z.string().url().safeParse(val).success, {
        message: `${capitalize(key)} must be a valid URI`,
      });
  }

  return value;
};

const handleStringPattern = ({ value, key, pattern }: { value: z.ZodString; key: string; pattern: string }) => {
  return value
    .transform((val) => (val === '' ? undefined : val))
    .refine((val) => !val || z.string().regex(new RegExp(pattern)).safeParse(val).success, {
      message: `${capitalize(key)} must be a valid value`,
    });
};

const handleStringType = ({
  key,
  format,
  pattern,
  enumValues,
  defaultValue,
  requiredFields,
}: {
  key: string;
  format?: string;
  pattern?: string;
  enumValues?: unknown;
  defaultValue?: unknown;
  requiredFields: Readonly<Array<string>>;
}) => {
  const isRequired = requiredFields.includes(key);

  let stringValue:
    | z.ZodString
    | z.ZodEffects<z.ZodTypeAny>
    | z.ZodEnum<[string, ...string[]]>
    | z.ZodDefault<z.ZodTypeAny> = z.string();

  if (format) {
    stringValue = handleStringFormat({
      value: stringValue,
      key,
      format,
    });
  } else if (pattern) {
    stringValue = handleStringPattern({
      value: stringValue,
      key,
      pattern,
    });
  } else if (enumValues) {
    stringValue = z.enum(enumValues as [string, ...string[]]);
  } else if (isRequired) {
    stringValue = stringValue.min(1);
  }

  if (defaultValue) {
    stringValue = stringValue.default(defaultValue as string);
  }

  return stringValue;
};

/**
 * Transform JSONSchema to Zod schema.
 * The function will recursively build the schema based on the JSONSchema object.
 * It removes empty strings and objects with empty required fields during the transformation phase after parsing.
 */
export const buildDynamicZodSchema = (obj: JSONSchemaDto): z.AnyZodObject => {
  const properties = typeof obj === 'object' ? (obj.properties ?? {}) : {};
  const requiredFields = typeof obj === 'object' ? (obj.required ?? []) : [];

  const keys: Record<string, z.ZodTypeAny> = Object.keys(properties).reduce((acc, key) => {
    const jsonSchemaProp = properties[key];
    if (typeof jsonSchemaProp !== 'object') {
      return acc;
    }

    let zodValue: ZodValue;
    const { type, format, pattern, enum: enumValues, default: defaultValue, required } = jsonSchemaProp;
    const isRequired = requiredFields.includes(key);

    if (type === 'object') {
      zodValue = buildDynamicZodSchema(jsonSchemaProp);
      if (defaultValue) {
        zodValue = zodValue.default(defaultValue as object);
      }
      zodValue = zodValue.transform((val) => {
        const hasAnyRequiredEmpty = required?.some((field) => val[field] === '' || val[field] === undefined);
        // remove object if any required field is empty or undefined
        return hasAnyRequiredEmpty ? undefined : val;
      });
      zodValue = zodValue.nullable();
    } else if (type === 'string') {
      zodValue = handleStringType({ key, requiredFields, format, pattern, enumValues, defaultValue });
    } else if (type === 'boolean') {
      zodValue = z.boolean();
    } else if (type === 'number') {
      zodValue = z.number();
      if (defaultValue) {
        zodValue = zodValue.default(defaultValue as number);
      }
    } else {
      zodValue = z.any();
    }

    if (!isRequired) {
      zodValue = zodValue.optional() as ZodValue;
    }

    return { ...acc, [key]: zodValue };
  }, {});

  return z.object({ ...keys });
};

/**
 * Build default values based on the UI Schema object.
 */
export const buildDefaultValues = (uiSchema: UiSchema): object => {
  const properties = typeof uiSchema === 'object' ? (uiSchema.properties ?? {}) : {};

  const keys: Record<string, unknown> = Object.keys(properties).reduce((acc, key) => {
    const property = properties[key];
    if (typeof property !== 'object') {
      return acc;
    }

    const { placeholder: defaultValue } = property;
    if (typeof defaultValue === 'undefined') {
      return acc;
    }

    if (defaultValue === null) {
      return { ...acc, [key]: defaultValue };
    }

    if (typeof defaultValue === 'object') {
      return { ...acc, [key]: buildDefaultValues({ properties: { ...defaultValue } }) };
    }

    return { ...acc, [key]: defaultValue };
  }, {});

  return keys;
};

const getProperties = (defaults: Record<string, unknown>, properties?: Record<string, JSONSchemaDefinition>): void => {
  if (!properties) return;

  for (const [key, propDef] of Object.entries(properties)) {
    const prop = propDef as JSONSchemaDto; // Narrowing to JSONSchemaDto for easier access to properties

    // Handle `default` value if specified
    if (prop.default !== undefined) {
      defaults[key] = prop.default;
      continue;
    }

    // Handle `type` to determine defaults
    if (prop.type === 'object' && prop.properties) {
      const nestedDefaults: Record<string, unknown> = {};
      getProperties(nestedDefaults, prop.properties);
      defaults[key] = nestedDefaults;
      continue;
    }

    if (prop.type === 'array' && prop.items) {
      const arrayDefaults: unknown[] = [];
      if (Array.isArray(prop.items)) {
        arrayDefaults.push(...prop.items.map(() => ({})));
      } else if (typeof prop.items === 'object' && (prop.items as JSONSchemaDto).type === 'object') {
        const itemDefaults: Record<string, unknown> = {};
        getProperties(itemDefaults, (prop.items as JSONSchemaDto).properties);
        arrayDefaults.push(itemDefaults);
      }
      defaults[key] = arrayDefaults;
      continue;
    }

    switch (prop.type) {
      case 'string':
        defaults[key] = '';
        break;
      case 'number':
      case 'integer':
        defaults[key] = undefined;
        break;
      case 'boolean':
        defaults[key] = false;
        break;
      case 'null':
        defaults[key] = null;
        break;
      default:
        defaults[key] = undefined; // Fallback for unknown or unsupported types
    }
  }
};

export const buildDefaultValuesOfDataSchema = (schema: JSONSchemaDto): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  getProperties(result, schema.properties);
  return result;
};
