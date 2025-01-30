/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  CredentialsDto,
  CredentialsDto$inboundSchema,
  CredentialsDto$Outbound,
  CredentialsDto$outboundSchema,
} from "./credentialsdto.js";
import {
  StepFilterDto,
  StepFilterDto$inboundSchema,
  StepFilterDto$Outbound,
  StepFilterDto$outboundSchema,
} from "./stepfilterdto.js";

export type UpdateIntegrationRequestDto = {
  name?: string | undefined;
  identifier?: string | undefined;
  environmentId?: string | undefined;
  /**
   * If the integration is active the validation on the credentials field will run
   */
  active?: boolean | undefined;
  credentials?: CredentialsDto | undefined;
  /**
   * If true, the Novu branding will be removed from the Inbox component
   */
  removeNovuBranding?: boolean | undefined;
  check?: boolean | undefined;
  conditions?: Array<StepFilterDto> | undefined;
};

/** @internal */
export const UpdateIntegrationRequestDto$inboundSchema: z.ZodType<
  UpdateIntegrationRequestDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.string().optional(),
  identifier: z.string().optional(),
  _environmentId: z.string().optional(),
  active: z.boolean().optional(),
  credentials: CredentialsDto$inboundSchema.optional(),
  removeNovuBranding: z.boolean().optional(),
  check: z.boolean().optional(),
  conditions: z.array(StepFilterDto$inboundSchema).optional(),
}).transform((v) => {
  return remap$(v, {
    "_environmentId": "environmentId",
  });
});

/** @internal */
export type UpdateIntegrationRequestDto$Outbound = {
  name?: string | undefined;
  identifier?: string | undefined;
  _environmentId?: string | undefined;
  active?: boolean | undefined;
  credentials?: CredentialsDto$Outbound | undefined;
  removeNovuBranding?: boolean | undefined;
  check?: boolean | undefined;
  conditions?: Array<StepFilterDto$Outbound> | undefined;
};

/** @internal */
export const UpdateIntegrationRequestDto$outboundSchema: z.ZodType<
  UpdateIntegrationRequestDto$Outbound,
  z.ZodTypeDef,
  UpdateIntegrationRequestDto
> = z.object({
  name: z.string().optional(),
  identifier: z.string().optional(),
  environmentId: z.string().optional(),
  active: z.boolean().optional(),
  credentials: CredentialsDto$outboundSchema.optional(),
  removeNovuBranding: z.boolean().optional(),
  check: z.boolean().optional(),
  conditions: z.array(StepFilterDto$outboundSchema).optional(),
}).transform((v) => {
  return remap$(v, {
    environmentId: "_environmentId",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace UpdateIntegrationRequestDto$ {
  /** @deprecated use `UpdateIntegrationRequestDto$inboundSchema` instead. */
  export const inboundSchema = UpdateIntegrationRequestDto$inboundSchema;
  /** @deprecated use `UpdateIntegrationRequestDto$outboundSchema` instead. */
  export const outboundSchema = UpdateIntegrationRequestDto$outboundSchema;
  /** @deprecated use `UpdateIntegrationRequestDto$Outbound` instead. */
  export type Outbound = UpdateIntegrationRequestDto$Outbound;
}

export function updateIntegrationRequestDtoToJSON(
  updateIntegrationRequestDto: UpdateIntegrationRequestDto,
): string {
  return JSON.stringify(
    UpdateIntegrationRequestDto$outboundSchema.parse(
      updateIntegrationRequestDto,
    ),
  );
}

export function updateIntegrationRequestDtoFromJSON(
  jsonString: string,
): SafeParseResult<UpdateIntegrationRequestDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => UpdateIntegrationRequestDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'UpdateIntegrationRequestDto' from JSON`,
  );
}
