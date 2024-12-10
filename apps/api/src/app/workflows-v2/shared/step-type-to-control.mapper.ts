import { ActionStepEnum, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { emailStepControlSchema, emailStepUiSchema, inAppControlSchema, inAppUiSchema } from './schemas';
import { DelayTimeControlSchema, delayUiSchema } from './schemas/delay-control.schema';
import { DigestOutputJsonSchema, digestUiSchema } from './schemas/digest-control.schema';
import { smsStepControl } from './schemas/sms-control.schema';
import { chatStepControl } from './schemas/chat-control.schema';

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
    schema: emailStepControlSchema,
    uiSchema: emailStepUiSchema,
  },
  [ChannelStepEnum.SMS]: {
    schema: smsStepControl.schema,
    uiSchema: smsStepControl.uiSchema,
  },
  [ChannelStepEnum.PUSH]: {
    schema: channelStepSchemas[ChannelStepEnum.PUSH].output as unknown as JSONSchemaDto,
  },
  [ChannelStepEnum.CHAT]: {
    schema: chatStepControl.schema,
    uiSchema: chatStepControl.uiSchema,
  },
  [ActionStepEnum.DELAY]: {
    schema: DelayTimeControlSchema,
    uiSchema: delayUiSchema,
  },
  [ActionStepEnum.DIGEST]: {
    schema: DigestOutputJsonSchema,
    uiSchema: digestUiSchema,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA,
  },
};
