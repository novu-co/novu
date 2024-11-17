import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

export const EmailStepControlSchema: JSONSchemaDto = {
  type: 'object',
  properties: {
    emailEditor: {
      type: 'string',
    },
    subject: {
      type: 'string',
    },
  },
  required: ['emailEditor', 'subject'],
  additionalProperties: false,
};
export const EmailStepUiSchema: UiSchema = {
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
