import { ActionStepEnum, actionStepSchemas, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { ControlSchemas } from '@novu/shared';
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
    schema: channelStepSchemas[ChannelStepEnum.SMS].output,
  },
  [ChannelStepEnum.PUSH]: {
    schema: channelStepSchemas[ChannelStepEnum.PUSH].output,
  },
  [ChannelStepEnum.CHAT]: {
    schema: channelStepSchemas[ChannelStepEnum.CHAT].output,
  },

  [ActionStepEnum.DELAY]: {
    schema: actionStepSchemas[ActionStepEnum.DELAY].output,
  },
  [ActionStepEnum.DIGEST]: {
    schema: actionStepSchemas[ActionStepEnum.DIGEST].output,
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA,
  },
};
