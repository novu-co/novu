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

export const delayControlZodSchema = z
  .object({
    skip: z.object({}).catchall(z.unknown()).optional(),
    type: z.enum(['regular']).default('regular'),
    amount: z.union([z.number().min(1), z.string()]),
    unit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export type DelayControlType = z.infer<typeof delayControlZodSchema>;

export const delayControlSchema = zodToJsonSchema(delayControlZodSchema) as JSONSchemaDto;
export const delayUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.DELAY,
  properties: {
    skip: skipStepUiSchema.properties.skip,
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
