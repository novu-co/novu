/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type SubscribersV1ControllerUpdateSubscriberPreferenceRequest = {
  subscriberId: string;
  workflowId: string;
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
  updateSubscriberPreferenceRequestDto:
    components.UpdateSubscriberPreferenceRequestDto;
};

export type SubscribersV1ControllerUpdateSubscriberPreferenceResponse = {
  headers: { [k: string]: Array<string> };
  result: components.UpdateSubscriberPreferenceResponseDto;
};

/** @internal */
export const SubscribersV1ControllerUpdateSubscriberPreferenceRequest$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest,
    z.ZodTypeDef,
    unknown
  > = z.object({
    subscriberId: z.string(),
    workflowId: z.string(),
    "idempotency-key": z.string().optional(),
    UpdateSubscriberPreferenceRequestDto:
      components.UpdateSubscriberPreferenceRequestDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "idempotency-key": "idempotencyKey",
      "UpdateSubscriberPreferenceRequestDto":
        "updateSubscriberPreferenceRequestDto",
    });
  });

/** @internal */
export type SubscribersV1ControllerUpdateSubscriberPreferenceRequest$Outbound =
  {
    subscriberId: string;
    workflowId: string;
    "idempotency-key"?: string | undefined;
    UpdateSubscriberPreferenceRequestDto:
      components.UpdateSubscriberPreferenceRequestDto$Outbound;
  };

/** @internal */
export const SubscribersV1ControllerUpdateSubscriberPreferenceRequest$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest
  > = z.object({
    subscriberId: z.string(),
    workflowId: z.string(),
    idempotencyKey: z.string().optional(),
    updateSubscriberPreferenceRequestDto:
      components.UpdateSubscriberPreferenceRequestDto$outboundSchema,
  }).transform((v) => {
    return remap$(v, {
      idempotencyKey: "idempotency-key",
      updateSubscriberPreferenceRequestDto:
        "UpdateSubscriberPreferenceRequestDto",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersV1ControllerUpdateSubscriberPreferenceRequest$ {
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceRequest$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceRequest$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceRequest$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest$Outbound;
}

export function subscribersV1ControllerUpdateSubscriberPreferenceRequestToJSON(
  subscribersV1ControllerUpdateSubscriberPreferenceRequest:
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest,
): string {
  return JSON.stringify(
    SubscribersV1ControllerUpdateSubscriberPreferenceRequest$outboundSchema
      .parse(subscribersV1ControllerUpdateSubscriberPreferenceRequest),
  );
}

export function subscribersV1ControllerUpdateSubscriberPreferenceRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerUpdateSubscriberPreferenceRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerUpdateSubscriberPreferenceRequest$inboundSchema
        .parse(JSON.parse(x)),
    `Failed to parse 'SubscribersV1ControllerUpdateSubscriberPreferenceRequest' from JSON`,
  );
}

/** @internal */
export const SubscribersV1ControllerUpdateSubscriberPreferenceResponse$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse,
    z.ZodTypeDef,
    unknown
  > = z.object({
    Headers: z.record(z.array(z.string())),
    Result: components.UpdateSubscriberPreferenceResponseDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "Headers": "headers",
      "Result": "result",
    });
  });

/** @internal */
export type SubscribersV1ControllerUpdateSubscriberPreferenceResponse$Outbound =
  {
    Headers: { [k: string]: Array<string> };
    Result: components.UpdateSubscriberPreferenceResponseDto$Outbound;
  };

/** @internal */
export const SubscribersV1ControllerUpdateSubscriberPreferenceResponse$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse
  > = z.object({
    headers: z.record(z.array(z.string())),
    result: components.UpdateSubscriberPreferenceResponseDto$outboundSchema,
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
export namespace SubscribersV1ControllerUpdateSubscriberPreferenceResponse$ {
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceResponse$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceResponse$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerUpdateSubscriberPreferenceResponse$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse$Outbound;
}

export function subscribersV1ControllerUpdateSubscriberPreferenceResponseToJSON(
  subscribersV1ControllerUpdateSubscriberPreferenceResponse:
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse,
): string {
  return JSON.stringify(
    SubscribersV1ControllerUpdateSubscriberPreferenceResponse$outboundSchema
      .parse(subscribersV1ControllerUpdateSubscriberPreferenceResponse),
  );
}

export function subscribersV1ControllerUpdateSubscriberPreferenceResponseFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerUpdateSubscriberPreferenceResponse,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerUpdateSubscriberPreferenceResponse$inboundSchema
        .parse(JSON.parse(x)),
    `Failed to parse 'SubscribersV1ControllerUpdateSubscriberPreferenceResponse' from JSON`,
  );
}
