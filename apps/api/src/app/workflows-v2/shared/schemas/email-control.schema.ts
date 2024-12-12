import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const EmailStepControlZodSchema = z
  .object({
    body: z.string().optional().default(''),
    subject: z.string().optional().default(''),
  })
  .strict();

export const emailStepControlSchema = zodToJsonSchema(EmailStepControlZodSchema) as JSONSchemaDto;

export type EmailStepControlType = z.infer<typeof EmailStepControlZodSchema>;

export const emailStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.EMAIL,
  properties: {
    body: {
      component: UiComponentEnum.MAILY,
    },
    subject: {
      component: UiComponentEnum.TEXT_INLINE_LABEL,
    },
  },
};
