import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

const redirectZodSchema = z
  .object({
    url: z.string().optional(),
    target: z.enum(['_self', '_blank', '_parent', '_top', '_unfencedTop']).default('_blank'),
  })
  .strict()
  .optional()
  .nullable();

const actionZodSchema = z
  .object({
    label: z.string().optional(),
    redirect: redirectZodSchema.optional(),
  })
  .strict()
  .optional()
  .nullable();

export const InAppControlZodSchema = z
  .object({
    subject: z.string().optional(),
    body: z.string(),
    avatar: z.string().optional(),
    primaryAction: actionZodSchema,
    secondaryAction: actionZodSchema,
    data: z.object({}).catchall(z.unknown()).optional(),
    redirect: redirectZodSchema,
  })
  .strict();

export type InAppRedirectType = z.infer<typeof redirectZodSchema>;
export type InAppActionType = z.infer<typeof actionZodSchema>;
export type InAppControlType = z.infer<typeof InAppControlZodSchema>;

export const InAppRedirectSchema = zodToJsonSchema(redirectZodSchema) as JSONSchemaDto;
export const InAppActionSchema = zodToJsonSchema(actionZodSchema) as JSONSchemaDto;
export const inAppControlSchema = zodToJsonSchema(InAppControlZodSchema) as JSONSchemaDto;

const redirectPlaceholder = {
  url: {
    placeholder: '',
  },
  target: {
    placeholder: '_self',
  },
};

export const inAppUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.IN_APP,
  properties: {
    body: {
      component: UiComponentEnum.IN_APP_BODY,
      placeholder: '',
    },
    avatar: {
      component: UiComponentEnum.IN_APP_AVATAR,
      placeholder: '',
    },
    subject: {
      component: UiComponentEnum.IN_APP_SUBJECT,
      placeholder: '',
    },
    primaryAction: {
      component: UiComponentEnum.IN_APP_BUTTON_DROPDOWN,
      placeholder: null,
    },
    secondaryAction: {
      component: UiComponentEnum.IN_APP_BUTTON_DROPDOWN,
      placeholder: null,
    },
    redirect: {
      component: UiComponentEnum.URL_TEXT_BOX,
      placeholder: redirectPlaceholder,
    },
  },
};
