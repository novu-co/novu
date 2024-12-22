import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { skipControl } from './skip-control.schema';

export const pushStepControlZodSchema = z
  .object({
    skip: skipControl.schema,
    subject: z.string(),
    body: z.string(),
  })
  .strict();

export type PushStepControlType = z.infer<typeof pushStepControlZodSchema>;

export const pushStepControlSchema = zodToJsonSchema(pushStepControlZodSchema) as JSONSchemaDto;
export const pushStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.PUSH,
  properties: {
    subject: {
      component: UiComponentEnum.PUSH_SUBJECT,
    },
    body: {
      component: UiComponentEnum.PUSH_BODY,
    },
    skip: skipControl.uiSchema.properties.skip,
  },
};

export const pushStepControl = {
  uiSchema: pushStepUiSchema,
  schema: pushStepControlSchema,
};
