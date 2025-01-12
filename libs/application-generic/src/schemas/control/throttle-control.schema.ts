import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  JSONSchemaDto,
  TimeUnitEnum,
  UiComponentEnum,
  UiSchema,
  UiSchemaGroupEnum,
} from '@novu/shared';
import { defaultOptions, skipStepUiSchema, skipZodSchema } from './shared';

export const throttleControlZodSchema = z
  .object({
    skip: skipZodSchema,
    amount: z.number().min(1),
    timeValue: z.number().min(1),
    timeUnit: z.nativeEnum(TimeUnitEnum),
  })
  .strict();

export type ThrottleControlType = z.infer<typeof throttleControlZodSchema>;

export const throttleControlSchema = zodToJsonSchema(
  throttleControlZodSchema,
  defaultOptions,
) as JSONSchemaDto;

export const throttleUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.THROTTLE,
  properties: {
    skip: skipStepUiSchema.properties.skip,
    amount: {
      component: UiComponentEnum.NUMBER_INPUT,
      label: 'Maximum number of notifications',
    },
    timeValue: {
      component: UiComponentEnum.NUMBER_INPUT,
      label: 'Time value',
    },
    timeUnit: {
      component: UiComponentEnum.TIME_UNIT,
      label: 'Time unit',
    },
  },
};
