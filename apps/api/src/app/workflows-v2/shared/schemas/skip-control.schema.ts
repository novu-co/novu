import { UiSchemaGroupEnum, UiSchema, UiComponentEnum } from '@novu/shared';

export const skipStepUiSchema = {
  group: UiSchemaGroupEnum.SKIP,
  properties: {
    skip: {
      component: UiComponentEnum.QUERY_EDITOR,
    },
  },
} satisfies UiSchema;
