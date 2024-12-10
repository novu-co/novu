import { UiSchemaGroupEnum, UiSchema, UiComponentEnum } from '@novu/shared';
import { z } from 'zod';

export const skipZodSchema = z.object({}).catchall(z.unknown()).optional();

export const skipStepUiSchema: UiSchema = {
  group: UiSchemaGroupEnum.SKIP,
  properties: {
    skip: {
      component: UiComponentEnum.SKIP_RULES,
    },
  },
};

export const smsStepControl = {
  uiSchema: skipStepUiSchema,
  schema: skipZodSchema,
};
