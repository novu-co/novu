import { ActionStepEnum, ChannelStepEnum } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { inAppControlSchema, inAppUiSchema } from './schemas/in-app-control.schema';
import { emailControlSchema, emailUiSchema } from './schemas/email-control.schema';
import { smsControlSchema, smsUiSchema } from './schemas/sms-control.schema';
import { pushControlSchema, pushUiSchema } from './schemas/push-control.schema';
import { chatControlSchema, chatUiSchema } from './schemas/chat-control.schema';
import { delayControlSchema, delayUiSchema } from './schemas/delay-control.schema';
import { digestControlSchema, digestUiSchema } from './schemas/digest-control.schema';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as JSONSchemaDto;

export const stepTypeToControlSchema: Record<ChannelStepEnum | ActionStepEnum, ControlSchemas> = {
  [ChannelStepEnum.IN_APP]: {
    schema: inAppControlSchema,
    uiSchema: inAppUiSchema,
  },
  [ChannelStepEnum.EMAIL]: {
    schema: emailControlSchema,
    uiSchema: emailUiSchema,
  },
  [ChannelStepEnum.SMS]: {
    schema: smsControlSchema,
    uiSchema: smsUiSchema,
  },
  [ChannelStepEnum.PUSH]: {
    schema: pushControlSchema,
    uiSchema: pushUiSchema,
  },
  [ChannelStepEnum.CHAT]: {
    schema: chatControlSchema,
    uiSchema: chatUiSchema,
  },
  [ActionStepEnum.DELAY]: {
    schema: delayControlSchema,
    uiSchema: delayUiSchema,
  },
  [ActionStepEnum.DIGEST]: {
    schema: digestControlSchema,
    uiSchema: digestUiSchema,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA,
  },
};
