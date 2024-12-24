import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  DigestUnitEnum,
  JSONSchemaDto,
  TimeUnitEnum,
  UiComponentEnum,
  UiSchema,
  UiSchemaGroupEnum,
} from '@novu/shared';
import { skipStepUiSchema } from './skip-control.schema';

const digestRegularControlZodSchema = z
  .object({
    skip: z.object({}).catchall(z.unknown()).optional(),
    amount: z.union([z.number().min(1), z.string().min(1)]),
    unit: z.nativeEnum(TimeUnitEnum),
    digestKey: z.string().optional(),
    lookBackWindow: z
      .object({
        amount: z.number().min(1),
        unit: z.nativeEnum(TimeUnitEnum),
      })
      .strict()
      .optional(),
  })
  .strict();
const digestTimedControlZodSchema = z
  .object({
    skip: z.object({}).catchall(z.unknown()).optional(),
    cron: z.string().min(1),
    digestKey: z.string().optional(),
  })
  .strict();

export type DigestRegularControlType = z.infer<typeof digestRegularControlZodSchema>;
export type DigestTimedControlType = z.infer<typeof digestTimedControlZodSchema>;
export type DigestControlSchemaType = z.infer<typeof digestControlZodSchema>;

export const digestControlZodSchema = z.union([digestRegularControlZodSchema, digestTimedControlZodSchema]);
export const digestControlSchema = zodToJsonSchema(digestControlZodSchema) as JSONSchemaDto;

export function isDigestRegularControl(data: unknown): data is DigestRegularControlType {
  const result = digestRegularControlZodSchema.safeParse(data);

  return result.success;
}

export function isDigestTimedControl(data: unknown): data is DigestTimedControlType {
  const result = digestTimedControlZodSchema.safeParse(data);

  return result.success;
}

export function isDigestControl(data: unknown): data is DigestControlSchemaType {
  const result = digestControlZodSchema.safeParse(data);

  return result.success;
}

export const digestUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DIGEST,
  properties: {
    amount: {
      component: UiComponentEnum.DIGEST_AMOUNT,
      placeholder: '',
    },
    unit: {
      component: UiComponentEnum.DIGEST_UNIT,
      placeholder: DigestUnitEnum.SECONDS,
    },
    digestKey: {
      component: UiComponentEnum.DIGEST_KEY,
      placeholder: '',
    },
    cron: {
      component: UiComponentEnum.DIGEST_CRON,
      placeholder: '',
    },
    skip: skipStepUiSchema.properties.skip,
  },
};
