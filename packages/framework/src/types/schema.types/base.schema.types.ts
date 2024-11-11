import type { JsonSchema, InferJsonSchema } from './json.schema.types';
import type { ZodSchemaMinimal, InferZodSchema } from './zod.schema.types';

/**
 * A schema used to validate a JSON object.
 */
export type Schema = JsonSchema | ZodSchemaMinimal;

/**
 * Main utility type for schema inference
 *
 * @param T - The Schema to infer the type of.
 * @param Options - Configuration options for the type inference. The `validated` flag determines whether the schema has been validated. If `validated` is true, all properties are required unless specified otherwise. If false, properties with default values are optional.
 */
type InferSchema<T extends Schema, Options extends { validated: boolean }> =
  | InferJsonSchema<T, Options>
  | InferZodSchema<T, Options>
  | never extends infer U
  ? // Check if all inferred types are `never`
    [U] extends [never]
    ? // If all inferred types are `never`, return an unknown record
      Record<string, unknown>
    : // At this point type `U` is still unknown, so we narrow it down to an unknown record
      U extends Record<string, unknown>
      ? // If `U` has a record type, return it
        U
      : // If `U` is not a record type, fallback to an unknown record
        Record<string, unknown>
  : Record<string, unknown>;

/**
 * Infer the type of a Schema for unvalidated data.
 *
 * The resulting type has default properties set to optional,
 * reflecting the fact that the data is unvalidated and has
 * not had default properties set.
 *
 * @example
 * ```ts
 * type MySchema = FromSchemaUnvalidated<typeof mySchema>;
 * ```
 */
export type FromSchemaUnvalidated<T extends Schema> = InferSchema<T, { validated: false }>;

/**
 * Infer the type of a Schema for validated data.
 *
 * The resulting type has default properties set to required,
 * reflecting the fact that the data has been validated and
 * default properties have been set.
 *
 * @example
 * ```ts
 * type MySchema = FromSchema<typeof mySchema>;
 * ```
 */
export type FromSchema<T extends Schema = Record<string, unknown>> = InferSchema<T, { validated: true }>;
