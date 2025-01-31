/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";

export type WorkflowInfoDto = {
  /**
   * Workflow slug
   */
  slug: string;
  /**
   * Unique identifier of the workflow
   */
  identifier: string;
  /**
   * Display name of the workflow
   */
  name: string;
};

/** @internal */
export const WorkflowInfoDto$inboundSchema: z.ZodType<
  WorkflowInfoDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  slug: z.string(),
  identifier: z.string(),
  name: z.string(),
});

/** @internal */
export type WorkflowInfoDto$Outbound = {
  slug: string;
  identifier: string;
  name: string;
};

/** @internal */
export const WorkflowInfoDto$outboundSchema: z.ZodType<
  WorkflowInfoDto$Outbound,
  z.ZodTypeDef,
  WorkflowInfoDto
> = z.object({
  slug: z.string(),
  identifier: z.string(),
  name: z.string(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace WorkflowInfoDto$ {
  /** @deprecated use `WorkflowInfoDto$inboundSchema` instead. */
  export const inboundSchema = WorkflowInfoDto$inboundSchema;
  /** @deprecated use `WorkflowInfoDto$outboundSchema` instead. */
  export const outboundSchema = WorkflowInfoDto$outboundSchema;
  /** @deprecated use `WorkflowInfoDto$Outbound` instead. */
  export type Outbound = WorkflowInfoDto$Outbound;
}

export function workflowInfoDtoToJSON(
  workflowInfoDto: WorkflowInfoDto,
): string {
  return JSON.stringify(WorkflowInfoDto$outboundSchema.parse(workflowInfoDto));
}

export function workflowInfoDtoFromJSON(
  jsonString: string,
): SafeParseResult<WorkflowInfoDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => WorkflowInfoDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'WorkflowInfoDto' from JSON`,
  );
}
