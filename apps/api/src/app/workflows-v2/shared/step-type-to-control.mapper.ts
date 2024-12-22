import { ActionStepEnum, ChannelStepEnum } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { emailStepControl, inAppControl } from './schemas';
import { delayControl } from './schemas/delay-control.schema';
import { digestControl } from './schemas/digest-control.schema';
import { smsStepControl } from './schemas/sms-control.schema';
import { chatStepControl } from './schemas/chat-control.schema';
import { pushStepControl } from './schemas/push-control.schema';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as JSONSchemaDto;

export const stepTypeToControlSchema: Record<ChannelStepEnum | ActionStepEnum, ControlSchemas> = {
  [ChannelStepEnum.IN_APP]: {
    schema: inAppControl.schema,
    uiSchema: inAppControl.uiSchema,
  },
  [ChannelStepEnum.EMAIL]: {
    schema: emailStepControl.schema,
    uiSchema: emailStepControl.uiSchema,
  },
  [ChannelStepEnum.SMS]: {
    schema: smsStepControl.schema,
    uiSchema: smsStepControl.uiSchema,
  },
  [ChannelStepEnum.PUSH]: {
    schema: pushStepControl.schema,
    uiSchema: pushStepControl.uiSchema,
  },
  [ChannelStepEnum.CHAT]: {
    schema: chatStepControl.schema,
    uiSchema: chatStepControl.uiSchema,
  },
  [ActionStepEnum.DELAY]: {
    schema: delayControl.schema,
    uiSchema: delayControl.uiSchema,
  },
  [ActionStepEnum.DIGEST]: {
    schema: digestControl.schema,
    uiSchema: digestControl.uiSchema,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA,
  },
};
