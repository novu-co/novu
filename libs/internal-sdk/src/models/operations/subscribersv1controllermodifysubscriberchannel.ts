/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type SubscribersV1ControllerModifySubscriberChannelRequest = {
  subscriberId: string;
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
  updateSubscriberChannelRequestDto:
    components.UpdateSubscriberChannelRequestDto;
};

export type SubscribersV1ControllerModifySubscriberChannelResponse = {
  headers: { [k: string]: Array<string> };
  result: components.SubscriberResponseDto;
};

/** @internal */
export const SubscribersV1ControllerModifySubscriberChannelRequest$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerModifySubscriberChannelRequest,
    z.ZodTypeDef,
    unknown
  > = z.object({
    subscriberId: z.string(),
    "idempotency-key": z.string().optional(),
    UpdateSubscriberChannelRequestDto:
      components.UpdateSubscriberChannelRequestDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "idempotency-key": "idempotencyKey",
      "UpdateSubscriberChannelRequestDto": "updateSubscriberChannelRequestDto",
    });
  });

/** @internal */
export type SubscribersV1ControllerModifySubscriberChannelRequest$Outbound = {
  subscriberId: string;
  "idempotency-key"?: string | undefined;
  UpdateSubscriberChannelRequestDto:
    components.UpdateSubscriberChannelRequestDto$Outbound;
};

/** @internal */
export const SubscribersV1ControllerModifySubscriberChannelRequest$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerModifySubscriberChannelRequest$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerModifySubscriberChannelRequest
  > = z.object({
    subscriberId: z.string(),
    idempotencyKey: z.string().optional(),
    updateSubscriberChannelRequestDto:
      components.UpdateSubscriberChannelRequestDto$outboundSchema,
  }).transform((v) => {
    return remap$(v, {
      idempotencyKey: "idempotency-key",
      updateSubscriberChannelRequestDto: "UpdateSubscriberChannelRequestDto",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersV1ControllerModifySubscriberChannelRequest$ {
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelRequest$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerModifySubscriberChannelRequest$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelRequest$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerModifySubscriberChannelRequest$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelRequest$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerModifySubscriberChannelRequest$Outbound;
}

export function subscribersV1ControllerModifySubscriberChannelRequestToJSON(
  subscribersV1ControllerModifySubscriberChannelRequest:
    SubscribersV1ControllerModifySubscriberChannelRequest,
): string {
  return JSON.stringify(
    SubscribersV1ControllerModifySubscriberChannelRequest$outboundSchema.parse(
      subscribersV1ControllerModifySubscriberChannelRequest,
    ),
  );
}

export function subscribersV1ControllerModifySubscriberChannelRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerModifySubscriberChannelRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerModifySubscriberChannelRequest$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'SubscribersV1ControllerModifySubscriberChannelRequest' from JSON`,
  );
}

/** @internal */
export const SubscribersV1ControllerModifySubscriberChannelResponse$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerModifySubscriberChannelResponse,
    z.ZodTypeDef,
    unknown
  > = z.object({
    Headers: z.record(z.array(z.string())),
    Result: components.SubscriberResponseDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "Headers": "headers",
      "Result": "result",
    });
  });

/** @internal */
export type SubscribersV1ControllerModifySubscriberChannelResponse$Outbound = {
  Headers: { [k: string]: Array<string> };
  Result: components.SubscriberResponseDto$Outbound;
};

/** @internal */
export const SubscribersV1ControllerModifySubscriberChannelResponse$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerModifySubscriberChannelResponse$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerModifySubscriberChannelResponse
  > = z.object({
    headers: z.record(z.array(z.string())),
    result: components.SubscriberResponseDto$outboundSchema,
  }).transform((v) => {
    return remap$(v, {
      headers: "Headers",
      result: "Result",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersV1ControllerModifySubscriberChannelResponse$ {
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelResponse$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerModifySubscriberChannelResponse$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelResponse$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerModifySubscriberChannelResponse$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerModifySubscriberChannelResponse$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerModifySubscriberChannelResponse$Outbound;
}

export function subscribersV1ControllerModifySubscriberChannelResponseToJSON(
  subscribersV1ControllerModifySubscriberChannelResponse:
    SubscribersV1ControllerModifySubscriberChannelResponse,
): string {
  return JSON.stringify(
    SubscribersV1ControllerModifySubscriberChannelResponse$outboundSchema.parse(
      subscribersV1ControllerModifySubscriberChannelResponse,
    ),
  );
}

export function subscribersV1ControllerModifySubscriberChannelResponseFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerModifySubscriberChannelResponse,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerModifySubscriberChannelResponse$inboundSchema
        .parse(JSON.parse(x)),
    `Failed to parse 'SubscribersV1ControllerModifySubscriberChannelResponse' from JSON`,
  );
}
