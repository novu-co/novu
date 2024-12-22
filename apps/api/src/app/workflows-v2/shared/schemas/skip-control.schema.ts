import { UiSchemaGroupEnum, UiSchema, UiComponentEnum } from '@novu/shared';
import { z } from 'zod';

const skipZodSchema = z.object({}).catchall(z.unknown()).optional();

const skipStepUiSchema = {
  group: UiSchemaGroupEnum.SKIP,
  properties: {
    skip: {
      component: UiComponentEnum.QUERY_EDITOR,
    },
  },
} satisfies UiSchema;

export const skipControl = {
  uiSchema: skipStepUiSchema,
  schema: skipZodSchema,
};
