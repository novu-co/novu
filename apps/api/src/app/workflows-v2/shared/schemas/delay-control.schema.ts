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

export const delayTimeControlZodSchema = z
  .object({
    skip: skipControl.schema,
    type: z.enum(['regular']).default('regular'),
    amount: z.union([z.number().min(1), z.string()]),
    unit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export type DelayTimeControlType = z.infer<typeof delayTimeControlZodSchema>;

const delayTimeControlSchema = zodToJsonSchema(delayTimeControlZodSchema) as JSONSchemaDto;
const delayUiSchema: UiSchema = {
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

export const delayControl = {
  uiSchema: delayUiSchema,
  schema: delayTimeControlSchema,
};
