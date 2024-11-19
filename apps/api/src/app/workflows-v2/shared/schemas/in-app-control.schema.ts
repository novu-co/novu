import { JSONSchemaDto, UiComponentEnum, UiSchema, UiSchemaGroupEnum } from '@novu/shared';

const redirectSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
    },
    target: {
      type: 'string',
      enum: ['_self', '_blank', '_parent', '_top', '_unfencedTop'],
      default: '_blank',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchemaDto;

const actionSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    redirect: redirectSchema,
  },
  required: ['label'],
  additionalProperties: false,
} as const satisfies JSONSchemaDto;

export const inAppControlSchema = {
  type: 'object',
  properties: {
    subject: { type: 'string' },
    body: { type: 'string' },
    avatar: { type: 'string' },
    primaryAction: actionSchema,
    secondaryAction: actionSchema,
    data: { type: 'object', additionalProperties: true },
    redirect: redirectSchema,
  },
  required: ['body'],
  additionalProperties: false,
} as const satisfies JSONSchemaDto;

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
