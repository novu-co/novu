import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { skipControl } from './skip-control.schema';

const smsStepControlZodSchema = z
  .object({
    skip: skipControl.schema,
    body: z.string(),
  })
  .strict();

export type SmsStepControlType = z.infer<typeof smsStepControlZodSchema>;

const smsStepControlSchema = zodToJsonSchema(smsStepControlZodSchema) as JSONSchemaDto;
const smsStepUiSchema: UiSchema = {
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
