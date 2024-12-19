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
import { skipControl } from './skip-control.schema';

const DigestRegularControlZodSchema = z
  .object({
    amount: z.union([z.number().min(1), z.string().min(1)]),
    skip: skipControl.schema,
    unit: z.nativeEnum(TimeUnitEnum).default(TimeUnitEnum.SECONDS),
    digestKey: z.string().optional(),
    lookBackWindow: z
      .object({
        amount: z.number().min(1),
        unit: z.nativeEnum(TimeUnitEnum).default(TimeUnitEnum.SECONDS),
      })
      .strict()
      .optional(),
  })
  .strict();

const DigestTimedControlZodSchema = z
  .object({
    cron: z.string().min(1),
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
    skip: skipControl.uiSchema.properties.skip,
  },
};
