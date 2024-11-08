import { JSONSchema } from 'json-schema-to-ts';
import { UiComponentEnum, UiSchema, UiSchemaGroupEnum, UiSchemaProperty } from '@novu/shared';

const ABSOLUTE_AND_RELATIVE_URL_REGEX = '^(?!mailto:)(?:(https?):\\/\\/[^\\s/$.?#].[^\\s]*)|^(\\/[^\\s]*)$';

const redirectSchema = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      pattern: ABSOLUTE_AND_RELATIVE_URL_REGEX,
    },
    target: {
      type: 'string',
      enum: ['_self', '_blank', '_parent', '_top', '_unfencedTop'],
      default: '_blank', // Default value for target
    },
  },
  required: ['url'], // url remains required
  additionalProperties: false, // No additional properties allowed
} as const satisfies JSONSchema;

const actionSchema = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    redirect: redirectSchema,
  },
  required: ['label'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const inAppControlSchema = {
  type: 'object',
  properties: {
    subject: { type: 'string' },
    body: { type: 'string' },
    avatar: { type: 'string', format: 'uri' },
    primaryAction: actionSchema, // Nested primaryAction
    secondaryAction: actionSchema, // Nested secondaryAction
    data: { type: 'object', additionalProperties: true },
    redirect: redirectSchema,
  },
  required: ['body'],
  additionalProperties: false,
} as const satisfies JSONSchema;

const redirectPlaceholder = {
  url: {
    placeholder: '',
  },
  target: {
    placeholder: '_self',
  },
};

export const InAppUiSchema: UiSchema = {
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
