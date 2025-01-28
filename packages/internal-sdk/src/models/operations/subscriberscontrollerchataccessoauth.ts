/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type SubscribersControllerChatAccessOauthRequest = {
  subscriberId: string;
  providerId: string;
  /**
   * HMAC hash for the request
   */
  hmacHash: string;
  /**
   * The ID of the environment, must be a valid MongoDB ID
   */
  environmentId: string;
  /**
   * Optional integration identifier
   */
  integrationIdentifier?: string | undefined;
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
};

export type SubscribersControllerChatAccessOauthResponse = {
  headers: { [k: string]: Array<string> };
};

/** @internal */
export const SubscribersControllerChatAccessOauthRequest$inboundSchema:
  z.ZodType<
    SubscribersControllerChatAccessOauthRequest,
    z.ZodTypeDef,
    unknown
  > = z.object({
    subscriberId: z.string(),
    providerId: z.string(),
    hmacHash: z.string(),
    environmentId: z.string(),
    integrationIdentifier: z.string().optional(),
    "idempotency-key": z.string().optional(),
  }).transform((v) => {
    return remap$(v, {
      "idempotency-key": "idempotencyKey",
    });
  });

/** @internal */
export type SubscribersControllerChatAccessOauthRequest$Outbound = {
  subscriberId: string;
  providerId: string;
  hmacHash: string;
  environmentId: string;
  integrationIdentifier?: string | undefined;
  "idempotency-key"?: string | undefined;
};

/** @internal */
export const SubscribersControllerChatAccessOauthRequest$outboundSchema:
  z.ZodType<
    SubscribersControllerChatAccessOauthRequest$Outbound,
    z.ZodTypeDef,
    SubscribersControllerChatAccessOauthRequest
  > = z.object({
    subscriberId: z.string(),
    providerId: z.string(),
    hmacHash: z.string(),
    environmentId: z.string(),
    integrationIdentifier: z.string().optional(),
    idempotencyKey: z.string().optional(),
  }).transform((v) => {
    return remap$(v, {
      idempotencyKey: "idempotency-key",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersControllerChatAccessOauthRequest$ {
  /** @deprecated use `SubscribersControllerChatAccessOauthRequest$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersControllerChatAccessOauthRequest$inboundSchema;
  /** @deprecated use `SubscribersControllerChatAccessOauthRequest$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersControllerChatAccessOauthRequest$outboundSchema;
  /** @deprecated use `SubscribersControllerChatAccessOauthRequest$Outbound` instead. */
  export type Outbound = SubscribersControllerChatAccessOauthRequest$Outbound;
}

export function subscribersControllerChatAccessOauthRequestToJSON(
  subscribersControllerChatAccessOauthRequest:
    SubscribersControllerChatAccessOauthRequest,
): string {
  return JSON.stringify(
    SubscribersControllerChatAccessOauthRequest$outboundSchema.parse(
      subscribersControllerChatAccessOauthRequest,
    ),
  );
}

export function subscribersControllerChatAccessOauthRequestFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersControllerChatAccessOauthRequest,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersControllerChatAccessOauthRequest$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'SubscribersControllerChatAccessOauthRequest' from JSON`,
  );
}

/** @internal */
export const SubscribersControllerChatAccessOauthResponse$inboundSchema:
  z.ZodType<
    SubscribersControllerChatAccessOauthResponse,
    z.ZodTypeDef,
    unknown
  > = z.object({
    Headers: z.record(z.array(z.string())),
  }).transform((v) => {
    return remap$(v, {
      "Headers": "headers",
    });
  });

/** @internal */
export type SubscribersControllerChatAccessOauthResponse$Outbound = {
  Headers: { [k: string]: Array<string> };
};

/** @internal */
export const SubscribersControllerChatAccessOauthResponse$outboundSchema:
  z.ZodType<
    SubscribersControllerChatAccessOauthResponse$Outbound,
    z.ZodTypeDef,
    SubscribersControllerChatAccessOauthResponse
  > = z.object({
    headers: z.record(z.array(z.string())),
  }).transform((v) => {
    return remap$(v, {
      headers: "Headers",
    });
  });

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscribersControllerChatAccessOauthResponse$ {
  /** @deprecated use `SubscribersControllerChatAccessOauthResponse$inboundSchema` instead. */
  export const inboundSchema =
    SubscribersControllerChatAccessOauthResponse$inboundSchema;
  /** @deprecated use `SubscribersControllerChatAccessOauthResponse$outboundSchema` instead. */
  export const outboundSchema =
    SubscribersControllerChatAccessOauthResponse$outboundSchema;
  /** @deprecated use `SubscribersControllerChatAccessOauthResponse$Outbound` instead. */
  export type Outbound = SubscribersControllerChatAccessOauthResponse$Outbound;
}

export function subscribersControllerChatAccessOauthResponseToJSON(
  subscribersControllerChatAccessOauthResponse:
    SubscribersControllerChatAccessOauthResponse,
): string {
  return JSON.stringify(
    SubscribersControllerChatAccessOauthResponse$outboundSchema.parse(
      subscribersControllerChatAccessOauthResponse,
    ),
  );
}

export function subscribersControllerChatAccessOauthResponseFromJSON(
  jsonString: string,
): SafeParseResult<
  SubscribersControllerChatAccessOauthResponse,
  SDKValidationError
> {
  return safeParse(
    jsonString,
    (x) =>
      SubscribersControllerChatAccessOauthResponse$inboundSchema.parse(
        JSON.parse(x),
      ),
    `Failed to parse 'SubscribersControllerChatAccessOauthResponse' from JSON`,
  );
}
