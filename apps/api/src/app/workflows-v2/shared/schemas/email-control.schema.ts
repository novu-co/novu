import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const TipTapNodeSchema = z.object({
  type: z.literal('doc'),
  content: z.array(
    z.object({
      type: z.string(),
      attrs: z.record(z.any()).optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
            marks: z
              .array(
                z.object({
                  type: z.string(),
                  attrs: z.record(z.any()).optional(),
                })
              )
              .optional(),
            attrs: z.record(z.any()).optional(),
          })
        )
        .optional(),
    })
  ),
});

export const EmailStepControlZodSchema = z
  .object({
    emailEditor: TipTapNodeSchema,
    subject: z.string(),
  })
  .strict()
  .required({
    emailEditor: true,
    subject: true,
  });

export const emailStepControlSchema = zodToJsonSchema(EmailStepControlZodSchema) as JSONSchemaDto;

export type EmailStepControlType = z.infer<typeof EmailStepControlZodSchema>;
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
