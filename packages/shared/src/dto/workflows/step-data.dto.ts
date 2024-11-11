import type { JSONSchemaDto } from './json-schema-dto';

export type StepDataDto = {
  controls: ControlsMetadata;
  variables: JSONSchemaDto;
  stepId: string;
  _id: string;
  name: string;
};

export enum UiSchemaGroupEnum {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
}

export enum UiComponentEnum {
  MAILY = 'MAILY',
  TEXT_FULL_LINE = 'TEXT_FULL_LINE',
  TEXT_INLINE_LABEL = 'TEXT_INLINE_LABEL',
  IN_APP_BODY = 'IN_APP_BODY',
  IN_APP_AVATAR = 'IN_APP_AVATAR',
  IN_APP_SUBJECT = 'IN_APP_PRIMARY_SUBJECT',
  IN_APP_BUTTON_DROPDOWN = 'IN_APP_BUTTON_DROPDOWN',
  URL_TEXT_BOX = 'URL_TEXT_BOX',
}

export class UiSchemaProperty {
  placeholder?: unknown;
  component: UiComponentEnum;
}

export class UiSchema {
  group?: UiSchemaGroupEnum;
  properties?: Record<string, UiSchemaProperty>;
}

export class ControlsMetadata {
  dataSchema?: JSONSchemaDto;
  uiSchema?: UiSchema;
  values: Record<string, unknown>;
}
