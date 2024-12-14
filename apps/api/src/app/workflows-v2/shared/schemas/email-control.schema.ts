import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { TipTapSchema } from '../../../environments-v1/usecases/output-renderers';

export const emailStepControlZodSchema = z
  .object({
    /*
     * todo: we need to validate the email editor by type and not string,
     * updating it to TipTapSchema will break the existing upsert issues generation
     */
    emailEditor: z.string(),
    /*
     * emailEditor: TipTapSchema,
     * body: z.string(),
     */
    subject: z.string().optional(),
  })
  .strict();
export const emailStepControlSchema = zodToJsonSchema(emailStepControlZodSchema) as JSONSchemaDto;
export type EmailStepControlType = z.infer<typeof emailStepControlZodSchema>;

export const emailStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.EMAIL,
  properties: {
    emailEditor: {
      component: UiComponentEnum.MAILY,
    },
    subject: {
      component: UiComponentEnum.TEXT_INLINE_LABEL,
    },
  },
};

export const emailStepControl = {
  uiSchema: emailStepUiSchema,
  schema: emailStepControlSchema,
};
