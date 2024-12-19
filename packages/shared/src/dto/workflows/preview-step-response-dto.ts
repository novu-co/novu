export class GeneratePreviewResponseDto {
  previewPayloadExample: PreviewPayload;
  result:
    | {
        type: ChannelTypeEnum.EMAIL;
        preview: EmailRenderOutput;
      }
    | {
        type: ChannelTypeEnum.IN_APP;
        preview: InAppRenderOutput;
      }
    | {
        type: ChannelTypeEnum.SMS;
        preview: SmsRenderOutput;
      }
    | {
        type: ChannelTypeEnum.PUSH;
        preview: PushRenderOutput;
      }
    | {
        type: ChannelTypeEnum.CHAT;
        preview: ChatRenderOutput;
      }
    | {
        type: ActionTypeEnum.DELAY;
        preview: DigestRenderOutput;
      }
    | {
        type: ActionTypeEnum.DIGEST;
        preview: DigestRenderOutput;
      };
}

export class PreviewPayload {
  subscriber?: Partial<SubscriberDto>;
  payload?: Record<string, unknown>;
  steps?: Record<string, unknown>; // step.stepId.unknown
}
