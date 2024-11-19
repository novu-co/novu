import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JSONSchemaDto, TimeUnitEnum } from '@novu/shared';

const DigestRegularControlZodSchema = z
  .object({
    amount: z.number(),
    unit: z.nativeEnum(TimeUnitEnum),
    digestKey: z.string().optional(),
    lookBackWindow: z
      .object({
        amount: z.number(),
        unit: z.nativeEnum(TimeUnitEnum),
      })
      .strict(),
  })
  .strict();

const DigestTimedControlZodSchema = z
  .object({
    cron: z.string(),
    digestKey: z.string().optional(),
  })
  .strict();

export const DigestControlZodSchema = z.union([DigestRegularControlZodSchema, DigestTimedControlZodSchema]);

export type DigestRegularControlType = z.infer<typeof DigestRegularControlZodSchema>;
export type DigestTimedControlType = z.infer<typeof DigestTimedControlZodSchema>;
export type DigestControlSchemaType = z.infer<typeof DigestControlZodSchema>;

export const DigestOutputJsonSchema = zodToJsonSchema(DigestControlZodSchema) as JSONSchemaDto;
export function isDigestRegularControl(data: unknown): data is DigestRegularControlType {
  const result = DigestRegularControlZodSchema.safeParse(data);

  return result.success;
}

export function isDigestTimedControl(data: unknown): data is DigestTimedControlType {
  const result = DigestTimedControlZodSchema.safeParse(data);

  return result.success;
}

export function isDigestControl(data: unknown): data is DigestControlSchemaType {
  const result = DigestControlZodSchema.safeParse(data);

  return result.success;
}
