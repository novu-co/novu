import { ActionStepEnum, actionStepSchemas, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { EmailStepControlSchema } from '@novu/shared';
import { ControlsDto, mapStepTypeToUiSchema } from '../../dtos/step-schema.dto';

export const PERMISSIVE_EMPTY_SCHEMA = {
  type: 'object',
  properties: {},
  required: [],
  additionalProperties: true,
} as const;

export const mapStepTypeToControlSchema: Record<ChannelStepEnum | ActionStepEnum, ControlsDto> = {
  [ChannelStepEnum.SMS]: {
    schema: channelStepSchemas[ChannelStepEnum.SMS].output,
    uiSchema: mapStepTypeToUiSchema[ChannelStepEnum.SMS],
  },
  [ChannelStepEnum.EMAIL]: {
    schema: EmailStepControlSchema,
    uiSchema: mapStepTypeToUiSchema[ChannelStepEnum.EMAIL],
  },
  [ChannelStepEnum.PUSH]: {
    schema: channelStepSchemas[ChannelStepEnum.PUSH].output,
    uiSchema: mapStepTypeToUiSchema[ChannelStepEnum.PUSH],
  },
  [ChannelStepEnum.CHAT]: {
    schema: channelStepSchemas[ChannelStepEnum.CHAT].output,
    uiSchema: mapStepTypeToUiSchema[ChannelStepEnum.CHAT],
  },
  [ChannelStepEnum.IN_APP]: {
    schema: channelStepSchemas[ChannelStepEnum.IN_APP].output,
    uiSchema: mapStepTypeToUiSchema[ChannelStepEnum.IN_APP],
  },
  [ActionStepEnum.DELAY]: {
    schema: actionStepSchemas[ActionStepEnum.DELAY].output,
    uiSchema: mapStepTypeToUiSchema[ActionStepEnum.DELAY],
  },
  [ActionStepEnum.DIGEST]: {
    schema: actionStepSchemas[ActionStepEnum.DIGEST].output,
    uiSchema: mapStepTypeToUiSchema[ActionStepEnum.DIGEST],
  },
  [ActionStepEnum.CUSTOM]: {
    schema: PERMISSIVE_EMPTY_SCHEMA,
    uiSchema: mapStepTypeToUiSchema[ActionStepEnum.CUSTOM],
  },
};
