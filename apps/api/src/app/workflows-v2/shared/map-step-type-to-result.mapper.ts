import { ActionStepEnum, actionStepSchemas, ChannelStepEnum, channelStepSchemas } from '@novu/framework/internal';
import { JSONSchema } from 'json-schema-to-ts';
import { StepTypeEnum } from '@novu/shared';

export function computeResultSchema(stepType: StepTypeEnum, payloadSchema?: JSONSchema) {
  const mapStepTypeToResult: Record<ChannelStepEnum & ActionStepEnum, JSONSchema> = {
    [ChannelStepEnum.SMS]: channelStepSchemas[ChannelStepEnum.SMS].result,
    [ChannelStepEnum.EMAIL]: channelStepSchemas[ChannelStepEnum.EMAIL].result,
    [ChannelStepEnum.PUSH]: channelStepSchemas[ChannelStepEnum.PUSH].result,
    [ChannelStepEnum.CHAT]: channelStepSchemas[ChannelStepEnum.CHAT].result,
    [ChannelStepEnum.IN_APP]: channelStepSchemas[ChannelStepEnum.IN_APP].result,
    [ActionStepEnum.DELAY]: actionStepSchemas[ActionStepEnum.DELAY].result,
    [ActionStepEnum.DIGEST]: buildDigestResult(payloadSchema),
  };

  return mapStepTypeToResult[stepType];
}

function buildDigestResult(payloadSchema?: JSONSchema) {
  return {
    type: 'object',
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            time: {
              type: 'string',
            },
            payload: payloadSchema || {
              type: 'object',
            },
          },
          required: ['id', 'time', 'payload'],
          additionalProperties: false,
        },
      },
    },
    required: ['events'],
    additionalProperties: false,
  };
}
