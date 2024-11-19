import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JSONSchemaDto, TimeUnitEnum } from '@novu/shared';

export const DelayTimeControlZodSchema = z
  .object({
    type: z.enum(['regular']).default('regular'),
    amount: z.number(),
    unit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export const DelayTimeControlSchema = zodToJsonSchema(DelayTimeControlZodSchema) as JSONSchemaDto;

export type DelayTimeControlType = z.infer<typeof DelayTimeControlZodSchema>;
