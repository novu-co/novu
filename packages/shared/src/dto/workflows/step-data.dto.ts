import type { JSONSchemaDto } from './json-schema-dto';
import { StepTypeEnum, WorkflowOriginEnum } from '../../types';
import { StepIssuesDto } from './workflow-response.dto';

export type StepDataDto = {
  controls: ControlsMetadata;
  variables: JSONSchemaDto;
  stepId: string;
  _id: string;
  name: string;
  type: StepTypeEnum;
  origin: WorkflowOriginEnum;
  workflowId: string;
  workflowDatabaseId: string;
  issues?: StepIssuesDto;
};

export enum UiSchemaGroupEnum {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  DIGEST = 'DIGEST',
  DELAY = 'DELAY',
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
  DIGEST_AMOUNT = 'DIGEST_AMOUNT',
  DIGEST_UNIT = 'DIGEST_UNIT',
  DIGEST_KEY = 'DIGEST_KEY',
  DIGEST_CRON = 'DIGEST_CRON',
  DELAY_TYPE = 'DELAY_TYPE',
  DELAY_AMOUNT = 'DELAY_AMOUNT',
  DELAY_UNIT = 'DELAY_UNIT',
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
