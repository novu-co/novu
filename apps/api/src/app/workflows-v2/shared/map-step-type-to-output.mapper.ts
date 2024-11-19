import { ActionStepEnum, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { ControlSchemas, JSONSchemaDto } from '@novu/shared';
import { emailStepControlSchema, emailStepUiSchema, inAppControlSchema, inAppUiSchema } from './schemas';
import { DelayTimeControlSchema, delayUiSchema } from './schemas/delay-control.schema';
import { DigestOutputJsonSchema, digestUiSchema } from './schemas/digest-control.schema';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as JSONSchemaDto;

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
