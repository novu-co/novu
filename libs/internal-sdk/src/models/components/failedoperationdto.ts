/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type FailedOperationDto = {
  /**
   * The error message associated with the failed operation.
   */
  message?: string | undefined;
  /**
   * The subscriber ID associated with the failed operation. This field is optional.
   */
  subscriberId?: string | undefined;
};

/** @internal */
export const FailedOperationDto$inboundSchema: z.ZodType<
  FailedOperationDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  message: z.string().optional(),
  subscriberId: z.string().optional(),
});

/** @internal */
export type FailedOperationDto$Outbound = {
  message?: string | undefined;
  subscriberId?: string | undefined;
};

/** @internal */
export const FailedOperationDto$outboundSchema: z.ZodType<
  FailedOperationDto$Outbound,
  z.ZodTypeDef,
  FailedOperationDto
> = z.object({
  message: z.string().optional(),
  subscriberId: z.string().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace FailedOperationDto$ {
  /** @deprecated use `FailedOperationDto$inboundSchema` instead. */
  export const inboundSchema = FailedOperationDto$inboundSchema;
  /** @deprecated use `FailedOperationDto$outboundSchema` instead. */
  export const outboundSchema = FailedOperationDto$outboundSchema;
  /** @deprecated use `FailedOperationDto$Outbound` instead. */
  export type Outbound = FailedOperationDto$Outbound;
}

export function failedOperationDtoToJSON(
  failedOperationDto: FailedOperationDto,
): string {
  return JSON.stringify(
    FailedOperationDto$outboundSchema.parse(failedOperationDto),
  );
}

export function failedOperationDtoFromJSON(
  jsonString: string,
): SafeParseResult<FailedOperationDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => FailedOperationDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'FailedOperationDto' from JSON`,
  );
}
