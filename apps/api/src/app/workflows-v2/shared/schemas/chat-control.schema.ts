import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { skipControl } from './skip-control.schema';

export const chatStepControlZodSchema = z
  .object({
    skip: skipControl.schema,
    body: z.string(),
  })
  .strict();

export type ChatStepControlType = z.infer<typeof chatStepControlZodSchema>;

const chatStepControlSchema = zodToJsonSchema(chatStepControlZodSchema) as JSONSchemaDto;
const chatStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.CHAT,
  properties: {
    body: {
      component: UiComponentEnum.CHAT_BODY,
    },
    skip: skipControl.uiSchema.properties.skip,
  },
};

export const chatStepControl = {
  uiSchema: chatStepUiSchema,
  schema: chatStepControlSchema,
};
