import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

export const ChatStepControlZodSchema = z
  .object({
    body: z.string(),
  })
  .strict();

export type ChatStepControlType = z.infer<typeof ChatStepControlZodSchema>;

export const chatStepControlSchema = zodToJsonSchema(ChatStepControlZodSchema) as JSONSchemaDto;
export const chatStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.CHAT,
  properties: {
    body: {
      component: UiComponentEnum.CHAT_BODY,
    },
  },
};

export const chatStepControl = {
  uiSchema: chatStepUiSchema,
  schema: chatStepControlSchema,
};
