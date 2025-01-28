/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { ClosedEnum } from "../../types/enums.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  BuilderFieldTypeEnum,
  BuilderFieldTypeEnum$inboundSchema,
  BuilderFieldTypeEnum$outboundSchema,
} from "./builderfieldtypeenum.js";
import {
  FieldFilterPartDto,
  FieldFilterPartDto$inboundSchema,
  FieldFilterPartDto$Outbound,
  FieldFilterPartDto$outboundSchema,
} from "./fieldfilterpartdto.js";

export const Value = {
  And: "AND",
  Or: "OR",
} as const;
export type Value = ClosedEnum<typeof Value>;

export type StepFilterDto = {
  isNegated: boolean;
  type: BuilderFieldTypeEnum;
  value: Value;
  children: Array<FieldFilterPartDto>;
};

/** @internal */
export const Value$inboundSchema: z.ZodNativeEnum<typeof Value> = z.nativeEnum(
  Value,
);

/** @internal */
export const Value$outboundSchema: z.ZodNativeEnum<typeof Value> =
  Value$inboundSchema;

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Value$ {
  /** @deprecated use `Value$inboundSchema` instead. */
  export const inboundSchema = Value$inboundSchema;
  /** @deprecated use `Value$outboundSchema` instead. */
  export const outboundSchema = Value$outboundSchema;
}

/** @internal */
export const StepFilterDto$inboundSchema: z.ZodType<
  StepFilterDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  isNegated: z.boolean(),
  type: BuilderFieldTypeEnum$inboundSchema,
  value: Value$inboundSchema,
  children: z.array(FieldFilterPartDto$inboundSchema),
});

/** @internal */
export type StepFilterDto$Outbound = {
  isNegated: boolean;
  type: string;
  value: string;
  children: Array<FieldFilterPartDto$Outbound>;
};

/** @internal */
export const StepFilterDto$outboundSchema: z.ZodType<
  StepFilterDto$Outbound,
  z.ZodTypeDef,
  StepFilterDto
> = z.object({
  isNegated: z.boolean(),
  type: BuilderFieldTypeEnum$outboundSchema,
  value: Value$outboundSchema,
  children: z.array(FieldFilterPartDto$outboundSchema),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace StepFilterDto$ {
  /** @deprecated use `StepFilterDto$inboundSchema` instead. */
  export const inboundSchema = StepFilterDto$inboundSchema;
  /** @deprecated use `StepFilterDto$outboundSchema` instead. */
  export const outboundSchema = StepFilterDto$outboundSchema;
  /** @deprecated use `StepFilterDto$Outbound` instead. */
  export type Outbound = StepFilterDto$Outbound;
}

export function stepFilterDtoToJSON(stepFilterDto: StepFilterDto): string {
  return JSON.stringify(StepFilterDto$outboundSchema.parse(stepFilterDto));
}

export function stepFilterDtoFromJSON(
  jsonString: string,
): SafeParseResult<StepFilterDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => StepFilterDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'StepFilterDto' from JSON`,
  );
}
