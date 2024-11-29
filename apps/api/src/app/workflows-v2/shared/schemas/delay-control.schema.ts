import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JSONSchemaDto, TimeUnitEnum, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

export const DelayTimeControlZodSchema = z
  .object({
    type: z.enum(['regular']).default('regular'),
    amount: z.number().default(30),
    unit: z.nativeEnum(TimeUnitEnum).default(TimeUnitEnum.SECONDS),
  })
  .strict();

export const DelayTimeControlSchema = zodToJsonSchema(DelayTimeControlZodSchema) as JSONSchemaDto;

export type DelayTimeControlType = z.infer<typeof DelayTimeControlZodSchema>;

export const delayUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DELAY,
  properties: {
    amount: {
      component: UiComponentEnum.DELAY_AMOUNT,
      placeholder: null,
    },
    unit: {
      component: UiComponentEnum.DELAY_UNIT,
      placeholder: null,
    },
    type: {
      component: UiComponentEnum.DELAY_TYPE,
      placeholder: null,
    },
  },
};
