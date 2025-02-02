/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

/**
 * Status of the trigger
 */
export const Status = {
  Error: "error",
  TriggerNotActive: "trigger_not_active",
  NoWorkflowActiveStepsDefined: "no_workflow_active_steps_defined",
  NoWorkflowStepsDefined: "no_workflow_steps_defined",
  Processed: "processed",
  NoTenantFound: "no_tenant_found",
} as const;
/**
 * Status of the trigger
 */
export type Status = ClosedEnum<typeof Status>;

export type TriggerEventResponseDto = {
  /**
   * Indicates whether the trigger was acknowledged or not
   */
  acknowledged: boolean;
  /**
   * Status of the trigger
   */
  status: Status;
  /**
   * In case of an error, this field will contain the error message(s)
   */
  error?: Array<string> | undefined;
  /**
   * The returned transaction ID of the trigger
   */
  transactionId?: string | undefined;
};

/** @internal */
export const Status$inboundSchema: z.ZodNativeEnum<typeof Status> = z
  .nativeEnum(Status);

/** @internal */
export const Status$outboundSchema: z.ZodNativeEnum<typeof Status> =
  Status$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Status$ {
  /** @deprecated use `Status$inboundSchema` instead. */
  export const inboundSchema = Status$inboundSchema;
  /** @deprecated use `Status$outboundSchema` instead. */
  export const outboundSchema = Status$outboundSchema;
}

/** @internal */
export const TriggerEventResponseDto$inboundSchema: z.ZodType<
  TriggerEventResponseDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  acknowledged: z.boolean(),
  status: Status$inboundSchema,
  error: z.array(z.string()).optional(),
  transactionId: z.string().optional(),
});

/** @internal */
export type TriggerEventResponseDto$Outbound = {
  acknowledged: boolean;
  status: string;
  error?: Array<string> | undefined;
  transactionId?: string | undefined;
};

/** @internal */
export const TriggerEventResponseDto$outboundSchema: z.ZodType<
  TriggerEventResponseDto$Outbound,
  z.ZodTypeDef,
  TriggerEventResponseDto
> = z.object({
  acknowledged: z.boolean(),
  status: Status$outboundSchema,
  error: z.array(z.string()).optional(),
  transactionId: z.string().optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TriggerEventResponseDto$ {
  /** @deprecated use `TriggerEventResponseDto$inboundSchema` instead. */
  export const inboundSchema = TriggerEventResponseDto$inboundSchema;
  /** @deprecated use `TriggerEventResponseDto$outboundSchema` instead. */
  export const outboundSchema = TriggerEventResponseDto$outboundSchema;
  /** @deprecated use `TriggerEventResponseDto$Outbound` instead. */
  export type Outbound = TriggerEventResponseDto$Outbound;
}

export function triggerEventResponseDtoToJSON(
  triggerEventResponseDto: TriggerEventResponseDto,
): string {
  return JSON.stringify(
    TriggerEventResponseDto$outboundSchema.parse(triggerEventResponseDto),
  );
}

export function triggerEventResponseDtoFromJSON(
  jsonString: string,
): SafeParseResult<TriggerEventResponseDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => TriggerEventResponseDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TriggerEventResponseDto' from JSON`,
  );
}
