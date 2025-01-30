/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  ChannelPreference,
  ChannelPreference$inboundSchema,
  ChannelPreference$Outbound,
  ChannelPreference$outboundSchema,
} from "./channelpreference.js";

export type UpdateSubscriberPreferenceRequestDto = {
  /**
   * Optional preferences for each channel type in the assigned workflow.
   */
  channel?: ChannelPreference | undefined;
  /**
   * Indicates whether the workflow is fully enabled for all channels for the subscriber.
   */
  enabled?: boolean | undefined;
};

/** @internal */
export const UpdateSubscriberPreferenceRequestDto$inboundSchema: z.ZodType<
  UpdateSubscriberPreferenceRequestDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  channel: ChannelPreference$inboundSchema.optional(),
  enabled: z.boolean().optional(),
});

/** @internal */
export type UpdateSubscriberPreferenceRequestDto$Outbound = {
  channel?: ChannelPreference$Outbound | undefined;
  enabled?: boolean | undefined;
};

/** @internal */
export const UpdateSubscriberPreferenceRequestDto$outboundSchema: z.ZodType<
  UpdateSubscriberPreferenceRequestDto$Outbound,
  z.ZodTypeDef,
  UpdateSubscriberPreferenceRequestDto
> = z.object({
  channel: ChannelPreference$outboundSchema.optional(),
  enabled: z.boolean().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateSubscriberPreferenceRequestDto$ {
  /** @deprecated use `UpdateSubscriberPreferenceRequestDto$inboundSchema` instead. */
  export const inboundSchema =
    UpdateSubscriberPreferenceRequestDto$inboundSchema;
  /** @deprecated use `UpdateSubscriberPreferenceRequestDto$outboundSchema` instead. */
  export const outboundSchema =
    UpdateSubscriberPreferenceRequestDto$outboundSchema;
  /** @deprecated use `UpdateSubscriberPreferenceRequestDto$Outbound` instead. */
  export type Outbound = UpdateSubscriberPreferenceRequestDto$Outbound;
}

export function updateSubscriberPreferenceRequestDtoToJSON(
  updateSubscriberPreferenceRequestDto: UpdateSubscriberPreferenceRequestDto,
): string {
  return JSON.stringify(
    UpdateSubscriberPreferenceRequestDto$outboundSchema.parse(
      updateSubscriberPreferenceRequestDto,
    ),
  );
}

export function updateSubscriberPreferenceRequestDtoFromJSON(
  jsonString: string,
): SafeParseResult<UpdateSubscriberPreferenceRequestDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      UpdateSubscriberPreferenceRequestDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateSubscriberPreferenceRequestDto' from JSON`,
  );
}
