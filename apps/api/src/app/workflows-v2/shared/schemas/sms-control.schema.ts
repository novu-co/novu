import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { skipControl } from './skip-control.schema';

export const SmsStepControlZodSchema = z
  .object({
    skip: skipControl.schema,
    body: z.string(),
  })
  .strict();

export type SmsStepControlType = z.infer<typeof SmsStepControlZodSchema>;

export const smsStepControlSchema = zodToJsonSchema(SmsStepControlZodSchema) as JSONSchemaDto;
export const smsStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.SMS,
  properties: {
    body: {
      component: UiComponentEnum.SMS_BODY,
    },
    skip: skipControl.uiSchema.properties.skip,
  },
};

export const smsStepControl = {
  uiSchema: smsStepUiSchema,
  schema: smsStepControlSchema,
};
