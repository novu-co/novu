import { JSONSchema } from 'json-schema-to-ts';
import { StepType } from '@novu/shared';

import { ActionStepEnum, ChannelStepEnum } from '@novu/framework/internal';

const chatProperties = {
  body: { type: 'chatBody' },
};

const emailProperties = {
  subject: { type: 'emailSubject' },
  body: { type: 'emailBody' },
};

const inAppProperties = {
  subject: { type: 'inAppSubject' },
  body: { type: 'inAppBody' },
  avatar: { type: 'inAppAvatar' },
  primaryAction: { type: 'inAppPrimaryAction' },
  secondaryAction: { type: 'inAppSecondaryAction' },
  data: { type: 'inAppData' },
  redirect: { type: 'inAppRedirect' },
};

const pushProperties = {
  subject: { type: 'pushSubject' },
  body: { type: 'pushBody' },
};

const smsProperties = {
  body: { type: 'smsBody' },
};

const delayProperties = {
  type: { type: 'delayType' },
  amount: { type: 'delayAmount' },
  unit: { type: 'delayUnit' },
};

const digestProperties = {
  amount: { type: 'digestAmount' },
  unit: { type: 'digestUnit' },
  digestKey: { type: 'digestKey' },
  lookBackWindow: { type: 'digestLookBackWindow' },
};

const customProperties = {};

type Properties =
  | typeof chatProperties
  | typeof emailProperties
  | typeof inAppProperties
  | typeof pushProperties
  | typeof smsProperties
  | typeof delayProperties
  | typeof digestProperties
  | typeof customProperties;

export type UiSchema = {
  type: `${StepType}`;
  properties: Properties;
};

export const mapStepTypeToUiSchema = {
  [ChannelStepEnum.SMS]: { type: 'sms', properties: smsProperties },
  [ChannelStepEnum.EMAIL]: { type: 'email', properties: emailProperties },
  [ChannelStepEnum.PUSH]: { type: 'push', properties: pushProperties },
  [ChannelStepEnum.CHAT]: { type: 'chat', properties: chatProperties },
  [ChannelStepEnum.IN_APP]: { type: 'in_app', properties: inAppProperties },
  [ActionStepEnum.DELAY]: { type: 'delay', properties: delayProperties },
  [ActionStepEnum.DIGEST]: { type: 'digest', properties: digestProperties },
  [ActionStepEnum.CUSTOM]: { type: 'custom', properties: customProperties },
} as const satisfies Record<ChannelStepEnum | ActionStepEnum, UiSchema>;

export class ControlsDto {
  schema: JSONSchema;
  uiSchema: UiSchema;
}

export type StepSchemaDto = {
  controls: ControlsDto;
  variables: JSONSchema;
};
