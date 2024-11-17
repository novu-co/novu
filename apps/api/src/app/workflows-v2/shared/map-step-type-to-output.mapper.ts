import { ActionStepEnum, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { emailStepControlSchema, emailStepUiSchema, inAppControlSchema, inAppUiSchema } from './schemas';
import { digestControlSchema } from './schemas/digest-control.schema';
import { delayControlSchema } from './schemas/delay-control.schema';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as const;

export const stepTypeToDefaultDashboardControlSchema: Record<ChannelStepEnum | ActionStepEnum, ControlSchemas> = {
  [ChannelStepEnum.IN_APP]: {
    schema: inAppControlSchema,
    uiSchema: inAppUiSchema,
  },
  [ChannelStepEnum.EMAIL]: {
    schema: emailStepControlSchema,
    uiSchema: emailStepUiSchema,
  },
  [ChannelStepEnum.SMS]: {
    schema: channelStepSchemas[ChannelStepEnum.SMS].output as unknown as JSONSchemaDto,
  },
  [ChannelStepEnum.PUSH]: {
    schema: channelStepSchemas[ChannelStepEnum.PUSH].output as unknown as JSONSchemaDto,
  },
  [ChannelStepEnum.CHAT]: {
    schema: channelStepSchemas[ChannelStepEnum.CHAT].output as unknown as JSONSchemaDto,
  },
  [ActionStepEnum.DELAY]: {
    schema: delayControlSchema.schema,
    uiSchema: delayControlSchema.uiSchema,
  },
  [ActionStepEnum.DIGEST]: {
    schema: digestControlSchema.schema,
    uiSchema: digestControlSchema.uiSchema,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA as unknown as JSONSchemaDto,
  },
};
