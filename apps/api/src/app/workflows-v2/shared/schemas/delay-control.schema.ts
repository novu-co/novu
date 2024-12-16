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

export const DelayTimeControlZodSchema = z
  .object({
    skip: skipControl.schema,
    type: z.enum(['regular']).default('regular'),
    amount: z.union([z.number().min(1), z.string()]),
    unit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export const DelayTimeControlSchema = zodToJsonSchema(DelayTimeControlZodSchema) as JSONSchemaDto;

export type DelayTimeControlType = z.infer<typeof DelayTimeControlZodSchema>;

export const delayUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DELAY,
  properties: {
    skip: skipControl.uiSchema.properties.skip,
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
