import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

export const PushStepControlZodSchema = z
  .object({
    subject: z.string(),
    body: z.string(),
  })
  .strict();

export type PushStepControlType = z.infer<typeof PushStepControlZodSchema>;

export const pushStepControlSchema = zodToJsonSchema(PushStepControlZodSchema) as JSONSchemaDto;
export const pushStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.PUSH,
  properties: {
    subject: {
      component: UiComponentEnum.PUSH_SUBJECT,
    },
    body: {
      component: UiComponentEnum.PUSH_BODY,
    },
  },
};

export const pushStepControl = {
  uiSchema: pushStepUiSchema,
  schema: pushStepControlSchema,
};
