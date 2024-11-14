import { ActionStepEnum, actionStepSchemas, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { EmailStepControlSchema, EmailStepUiSchema, inAppControlSchema, InAppUiSchema } from './schemas';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as const;

export const stepTypeToDefaultDashboardControlSchema: Record<ChannelStepEnum | ActionStepEnum, ControlSchemas> = {
  [ChannelStepEnum.IN_APP]: {
    schema: inAppControlSchema,
    uiSchema: InAppUiSchema,
  },
  [ChannelStepEnum.EMAIL]: {
    schema: EmailStepControlSchema,
    uiSchema: EmailStepUiSchema,
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
    schema: actionStepSchemas[ActionStepEnum.DELAY].output as unknown as JSONSchemaDto,
  },
  [ActionStepEnum.DIGEST]: {
    schema: actionStepSchemas[ActionStepEnum.DIGEST].output as unknown as JSONSchemaDto,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA as unknown as JSONSchemaDto,
  },
};
