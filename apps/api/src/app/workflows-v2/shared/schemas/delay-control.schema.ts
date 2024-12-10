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

export const DelayTimeControlZodSchema = z
  .object({
    type: z.enum(['regular']).default('regular'),
    amount: z.number().min(1),
    unit: z.nativeEnum(TimeUnitEnum),
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
      placeholder: DigestUnitEnum.SECONDS,
    },
    type: {
      component: UiComponentEnum.DELAY_TYPE,
      placeholder: 'regular',
    },
  },
};
