import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { skipControl } from './skip-control.schema';
import { TipTapSchema } from '../../../environments-v1/usecases/output-renderers';

export const emailStepControlZodSchema = z
  .object({
    skip: skipControl.schema,
    /*
     * todo: we need to validate the email editor (body) by type and not string,
     * updating it to TipTapSchema will break the existing upsert issues generation
     */
    body: z.string().optional().default(''),
    subject: z.string().optional().default(''),
  })
  .strict();

export const emailStepControlSchema = zodToJsonSchema(emailStepControlZodSchema) as JSONSchemaDto;
export type EmailStepControlType = z.infer<typeof emailStepControlZodSchema>;

export const emailStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.EMAIL,
  properties: {
    body: {
      component: UiComponentEnum.BLOCK_EDITOR,
    },
    subject: {
      component: UiComponentEnum.TEXT_INLINE_LABEL,
    },
    skip: skipControl.uiSchema.properties.skip,
  },
};

export const emailStepControl = {
  uiSchema: emailStepUiSchema,
  schema: emailStepControlSchema,
};
