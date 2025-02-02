/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type SubscribersV1ControllerCreateSubscriberRequest = {
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
  createSubscriberRequestDto: components.CreateSubscriberRequestDto;
};

export type SubscribersV1ControllerCreateSubscriberResponse = {
  headers: { [k: string]: Array<string> };
  result: components.SubscriberResponseDto;
};

/** @internal */
export const SubscribersV1ControllerCreateSubscriberRequest$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerCreateSubscriberRequest,
    z.ZodTypeDef,
    unknown
  > = z.object({
    "idempotency-key": z.string().optional(),
    CreateSubscriberRequestDto:
      components.CreateSubscriberRequestDto$inboundSchema,
  }).transform((v) => {
    return remap$(v, {
      "idempotency-key": "idempotencyKey",
      "CreateSubscriberRequestDto": "createSubscriberRequestDto",
    });
  });

/** @internal */
export type SubscribersV1ControllerCreateSubscriberRequest$Outbound = {
  "idempotency-key"?: string | undefined;
  CreateSubscriberRequestDto: components.CreateSubscriberRequestDto$Outbound;
};

/** @internal */
export const SubscribersV1ControllerCreateSubscriberRequest$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerCreateSubscriberRequest$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerCreateSubscriberRequest
  > = z.object({
    idempotencyKey: z.string().optional(),
    createSubscriberRequestDto:
      components.CreateSubscriberRequestDto$outboundSchema,
  }).transform((v) => {
    return remap$(v, {
      idempotencyKey: "idempotency-key",
      createSubscriberRequestDto: "CreateSubscriberRequestDto",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersV1ControllerCreateSubscriberRequest$ {
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberRequest$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerCreateSubscriberRequest$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberRequest$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerCreateSubscriberRequest$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberRequest$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerCreateSubscriberRequest$Outbound;
}

export function subscribersV1ControllerCreateSubscriberRequestToJSON(
  subscribersV1ControllerCreateSubscriberRequest:
    SubscribersV1ControllerCreateSubscriberRequest,
): string {
  return JSON.stringify(
    SubscribersV1ControllerCreateSubscriberRequest$outboundSchema.parse(
      subscribersV1ControllerCreateSubscriberRequest,
    ),
  );
}

export function subscribersV1ControllerCreateSubscriberRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerCreateSubscriberRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerCreateSubscriberRequest$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'SubscribersV1ControllerCreateSubscriberRequest' from JSON`,
  );
}

/** @internal */
export const SubscribersV1ControllerCreateSubscriberResponse$inboundSchema:
  z.ZodType<
    SubscribersV1ControllerCreateSubscriberResponse,
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
export type SubscribersV1ControllerCreateSubscriberResponse$Outbound = {
  Headers: { [k: string]: Array<string> };
  Result: components.SubscriberResponseDto$Outbound;
};

/** @internal */
export const SubscribersV1ControllerCreateSubscriberResponse$outboundSchema:
  z.ZodType<
    SubscribersV1ControllerCreateSubscriberResponse$Outbound,
    z.ZodTypeDef,
    SubscribersV1ControllerCreateSubscriberResponse
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
export namespace SubscribersV1ControllerCreateSubscriberResponse$ {
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberResponse$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersV1ControllerCreateSubscriberResponse$inboundSchema;
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberResponse$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersV1ControllerCreateSubscriberResponse$outboundSchema;
  /** @deprecated use `SubscribersV1ControllerCreateSubscriberResponse$Outbound` instead. */
  export type Outbound =
    SubscribersV1ControllerCreateSubscriberResponse$Outbound;
}

export function subscribersV1ControllerCreateSubscriberResponseToJSON(
  subscribersV1ControllerCreateSubscriberResponse:
    SubscribersV1ControllerCreateSubscriberResponse,
): string {
  return JSON.stringify(
    SubscribersV1ControllerCreateSubscriberResponse$outboundSchema.parse(
      subscribersV1ControllerCreateSubscriberResponse,
    ),
  );
}

export function subscribersV1ControllerCreateSubscriberResponseFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersV1ControllerCreateSubscriberResponse,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersV1ControllerCreateSubscriberResponse$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'SubscribersV1ControllerCreateSubscriberResponse' from JSON`,
  );
}
