/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import * as components from "../components/index.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type TopicsControllerCreateTopicRequest = {
  /**
   * A header for idempotency purposes
   */
  idempotencyKey?: string | undefined;
  createTopicRequestDto: components.CreateTopicRequestDto;
};

export type TopicsControllerCreateTopicResponse = {
  headers: { [k: string]: Array<string> };
  result: components.CreateTopicResponseDto;
};

/** @internal */
export const TopicsControllerCreateTopicRequest$inboundSchema: z.ZodType<
  TopicsControllerCreateTopicRequest,
  z.ZodTypeDef,
  unknown
> = z.object({
  "idempotency-key": z.string().optional(),
  CreateTopicRequestDto: components.CreateTopicRequestDto$inboundSchema,
}).transform((v) => {
  return remap$(v, {
    "idempotency-key": "idempotencyKey",
    "CreateTopicRequestDto": "createTopicRequestDto",
  });
});

/** @internal */
export type TopicsControllerCreateTopicRequest$Outbound = {
  "idempotency-key"?: string | undefined;
  CreateTopicRequestDto: components.CreateTopicRequestDto$Outbound;
};

/** @internal */
export const TopicsControllerCreateTopicRequest$outboundSchema: z.ZodType<
  TopicsControllerCreateTopicRequest$Outbound,
  z.ZodTypeDef,
  TopicsControllerCreateTopicRequest
> = z.object({
  idempotencyKey: z.string().optional(),
  createTopicRequestDto: components.CreateTopicRequestDto$outboundSchema,
}).transform((v) => {
  return remap$(v, {
    idempotencyKey: "idempotency-key",
    createTopicRequestDto: "CreateTopicRequestDto",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TopicsControllerCreateTopicRequest$ {
  /** @deprecated use `TopicsControllerCreateTopicRequest$inboundSchema` instead. */
  export const inboundSchema = TopicsControllerCreateTopicRequest$inboundSchema;
  /** @deprecated use `TopicsControllerCreateTopicRequest$outboundSchema` instead. */
  export const outboundSchema =
    TopicsControllerCreateTopicRequest$outboundSchema;
  /** @deprecated use `TopicsControllerCreateTopicRequest$Outbound` instead. */
  export type Outbound = TopicsControllerCreateTopicRequest$Outbound;
}

export function topicsControllerCreateTopicRequestToJSON(
  topicsControllerCreateTopicRequest: TopicsControllerCreateTopicRequest,
): string {
  return JSON.stringify(
    TopicsControllerCreateTopicRequest$outboundSchema.parse(
      topicsControllerCreateTopicRequest,
    ),
  );
}

export function topicsControllerCreateTopicRequestFromJSON(
  jsonString: string,
): SafeParseResult<TopicsControllerCreateTopicRequest, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      TopicsControllerCreateTopicRequest$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TopicsControllerCreateTopicRequest' from JSON`,
  );
}

/** @internal */
export const TopicsControllerCreateTopicResponse$inboundSchema: z.ZodType<
  TopicsControllerCreateTopicResponse,
  z.ZodTypeDef,
  unknown
> = z.object({
  Headers: z.record(z.array(z.string())),
  Result: components.CreateTopicResponseDto$inboundSchema,
}).transform((v) => {
  return remap$(v, {
    "Headers": "headers",
    "Result": "result",
  });
});

/** @internal */
export type TopicsControllerCreateTopicResponse$Outbound = {
  Headers: { [k: string]: Array<string> };
  Result: components.CreateTopicResponseDto$Outbound;
};

/** @internal */
export const TopicsControllerCreateTopicResponse$outboundSchema: z.ZodType<
  TopicsControllerCreateTopicResponse$Outbound,
  z.ZodTypeDef,
  TopicsControllerCreateTopicResponse
> = z.object({
  headers: z.record(z.array(z.string())),
  result: components.CreateTopicResponseDto$outboundSchema,
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
export namespace TopicsControllerCreateTopicResponse$ {
  /** @deprecated use `TopicsControllerCreateTopicResponse$inboundSchema` instead. */
  export const inboundSchema =
    TopicsControllerCreateTopicResponse$inboundSchema;
  /** @deprecated use `TopicsControllerCreateTopicResponse$outboundSchema` instead. */
  export const outboundSchema =
    TopicsControllerCreateTopicResponse$outboundSchema;
  /** @deprecated use `TopicsControllerCreateTopicResponse$Outbound` instead. */
  export type Outbound = TopicsControllerCreateTopicResponse$Outbound;
}

export function topicsControllerCreateTopicResponseToJSON(
  topicsControllerCreateTopicResponse: TopicsControllerCreateTopicResponse,
): string {
  return JSON.stringify(
    TopicsControllerCreateTopicResponse$outboundSchema.parse(
      topicsControllerCreateTopicResponse,
    ),
  );
}

export function topicsControllerCreateTopicResponseFromJSON(
  jsonString: string,
): SafeParseResult<TopicsControllerCreateTopicResponse, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) =>
      TopicsControllerCreateTopicResponse$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TopicsControllerCreateTopicResponse' from JSON`,
  );
}
