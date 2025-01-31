/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type PreferenceChannelsDto = {
  /**
   * Email channel preference
   */
  email?: boolean | undefined;
  /**
   * SMS channel preference
   */
  sms?: boolean | undefined;
  /**
   * In-app channel preference
   */
  inApp?: boolean | undefined;
  /**
   * Push channel preference
   */
  push?: boolean | undefined;
  /**
   * Chat channel preference
   */
  chat?: boolean | undefined;
};

/** @internal */
export const PreferenceChannelsDto$inboundSchema: z.ZodType<
  PreferenceChannelsDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  in_app: z.boolean().optional(),
  push: z.boolean().optional(),
  chat: z.boolean().optional(),
}).transform((v) => {
  return remap$(v, {
    "in_app": "inApp",
  });
});

/** @internal */
export type PreferenceChannelsDto$Outbound = {
  email?: boolean | undefined;
  sms?: boolean | undefined;
  in_app?: boolean | undefined;
  push?: boolean | undefined;
  chat?: boolean | undefined;
};

/** @internal */
export const PreferenceChannelsDto$outboundSchema: z.ZodType<
  PreferenceChannelsDto$Outbound,
  z.ZodTypeDef,
  PreferenceChannelsDto
> = z.object({
  email: z.boolean().optional(),
  sms: z.boolean().optional(),
  inApp: z.boolean().optional(),
  push: z.boolean().optional(),
  chat: z.boolean().optional(),
}).transform((v) => {
  return remap$(v, {
    inApp: "in_app",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace PreferenceChannelsDto$ {
  /** @deprecated use `PreferenceChannelsDto$inboundSchema` instead. */
  export const inboundSchema = PreferenceChannelsDto$inboundSchema;
  /** @deprecated use `PreferenceChannelsDto$outboundSchema` instead. */
  export const outboundSchema = PreferenceChannelsDto$outboundSchema;
  /** @deprecated use `PreferenceChannelsDto$Outbound` instead. */
  export type Outbound = PreferenceChannelsDto$Outbound;
}

export function preferenceChannelsDtoToJSON(
  preferenceChannelsDto: PreferenceChannelsDto,
): string {
  return JSON.stringify(
    PreferenceChannelsDto$outboundSchema.parse(preferenceChannelsDto),
  );
}

export function preferenceChannelsDtoFromJSON(
  jsonString: string,
): SafeParseResult<PreferenceChannelsDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => PreferenceChannelsDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'PreferenceChannelsDto' from JSON`,
  );
}
