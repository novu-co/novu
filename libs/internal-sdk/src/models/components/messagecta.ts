/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  ChannelCTATypeEnum,
  ChannelCTATypeEnum$inboundSchema,
  ChannelCTATypeEnum$outboundSchema,
} from "./channelctatypeenum.js";
import {
  MessageAction,
  MessageAction$inboundSchema,
  MessageAction$Outbound,
  MessageAction$outboundSchema,
} from "./messageaction.js";
import {
  MessageCTAData,
  MessageCTAData$inboundSchema,
  MessageCTAData$Outbound,
  MessageCTAData$outboundSchema,
} from "./messagectadata.js";

export type MessageCTA = {
  /**
   * Type of call to action
   */
  type?: ChannelCTATypeEnum | undefined;
  /**
   * Data associated with the call to action
   */
  data: MessageCTAData;
  /**
   * Action associated with the call to action
   */
  action?: MessageAction | undefined;
};

/** @internal */
export const MessageCTA$inboundSchema: z.ZodType<
  MessageCTA,
  z.ZodTypeDef,
  unknown
> = z.object({
  type: ChannelCTATypeEnum$inboundSchema.optional(),
  data: MessageCTAData$inboundSchema,
  action: MessageAction$inboundSchema.optional(),
});

/** @internal */
export type MessageCTA$Outbound = {
  type?: string | undefined;
  data: MessageCTAData$Outbound;
  action?: MessageAction$Outbound | undefined;
};

/** @internal */
export const MessageCTA$outboundSchema: z.ZodType<
  MessageCTA$Outbound,
  z.ZodTypeDef,
  MessageCTA
> = z.object({
  type: ChannelCTATypeEnum$outboundSchema.optional(),
  data: MessageCTAData$outboundSchema,
  action: MessageAction$outboundSchema.optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace MessageCTA$ {
  /** @deprecated use `MessageCTA$inboundSchema` instead. */
  export const inboundSchema = MessageCTA$inboundSchema;
  /** @deprecated use `MessageCTA$outboundSchema` instead. */
  export const outboundSchema = MessageCTA$outboundSchema;
  /** @deprecated use `MessageCTA$Outbound` instead. */
  export type Outbound = MessageCTA$Outbound;
}

export function messageCTAToJSON(messageCTA: MessageCTA): string {
  return JSON.stringify(MessageCTA$outboundSchema.parse(messageCTA));
}

export function messageCTAFromJSON(
  jsonString: string,
): SafeParseResult<MessageCTA, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => MessageCTA$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'MessageCTA' from JSON`,
  );
}
