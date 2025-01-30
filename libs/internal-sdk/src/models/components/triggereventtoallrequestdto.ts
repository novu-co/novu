/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  SubscriberPayloadDto,
  SubscriberPayloadDto$inboundSchema,
  SubscriberPayloadDto$Outbound,
  SubscriberPayloadDto$outboundSchema,
} from "./subscriberpayloaddto.js";
import {
  TenantPayloadDto,
  TenantPayloadDto$inboundSchema,
  TenantPayloadDto$Outbound,
  TenantPayloadDto$outboundSchema,
} from "./tenantpayloaddto.js";

/**
 * This could be used to override provider specific configurations
 */
export type Overrides = {};

/**
 * It is used to display the Avatar of the provided actor's subscriber id or actor object.
 *
 * @remarks
 *     If a new actor object is provided, we will create a new subscriber in our system
 */
export type TriggerEventToAllRequestDtoActor = SubscriberPayloadDto | string;

/**
 * It is used to specify a tenant context during trigger event.
 *
 * @remarks
 *     If a new tenant object is provided, we will create a new tenant.
 */
export type TriggerEventToAllRequestDtoTenant = TenantPayloadDto | string;

export type TriggerEventToAllRequestDto = {
  /**
   * The trigger identifier associated for the template you wish to send. This identifier can be found on the template page.
   */
  name: string;
  /**
   * The payload object is used to pass additional information that
   *
   * @remarks
   *     could be used to render the template, or perform routing rules based on it.
   *       For In-App channel, payload data are also available in <Inbox />
   */
  payload: { [k: string]: any };
  /**
   * This could be used to override provider specific configurations
   */
  overrides?: Overrides | undefined;
  /**
   * A unique identifier for this transaction, we will generated a UUID if not provided.
   */
  transactionId?: string | undefined;
  /**
   * It is used to display the Avatar of the provided actor's subscriber id or actor object.
   *
   * @remarks
   *     If a new actor object is provided, we will create a new subscriber in our system
   */
  actor?: SubscriberPayloadDto | string | undefined;
  /**
   * It is used to specify a tenant context during trigger event.
   *
   * @remarks
   *     If a new tenant object is provided, we will create a new tenant.
   */
  tenant?: TenantPayloadDto | string | undefined;
};

/** @internal */
export const Overrides$inboundSchema: z.ZodType<
  Overrides,
  z.ZodTypeDef,
  unknown
> = z.object({});

/** @internal */
export type Overrides$Outbound = {};

/** @internal */
export const Overrides$outboundSchema: z.ZodType<
  Overrides$Outbound,
  z.ZodTypeDef,
  Overrides
> = z.object({});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace Overrides$ {
  /** @deprecated use `Overrides$inboundSchema` instead. */
  export const inboundSchema = Overrides$inboundSchema;
  /** @deprecated use `Overrides$outboundSchema` instead. */
  export const outboundSchema = Overrides$outboundSchema;
  /** @deprecated use `Overrides$Outbound` instead. */
  export type Outbound = Overrides$Outbound;
}

export function overridesToJSON(overrides: Overrides): string {
  return JSON.stringify(Overrides$outboundSchema.parse(overrides));
}

export function overridesFromJSON(
  jsonString: string,
): SafeParseResult<Overrides, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => Overrides$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'Overrides' from JSON`,
  );
}

/** @internal */
export const TriggerEventToAllRequestDtoActor$inboundSchema: z.ZodType<
  TriggerEventToAllRequestDtoActor,
  z.ZodTypeDef,
  unknown
> = z.union([SubscriberPayloadDto$inboundSchema, z.string()]);

/** @internal */
export type TriggerEventToAllRequestDtoActor$Outbound =
  | SubscriberPayloadDto$Outbound
  | string;

/** @internal */
export const TriggerEventToAllRequestDtoActor$outboundSchema: z.ZodType<
  TriggerEventToAllRequestDtoActor$Outbound,
  z.ZodTypeDef,
  TriggerEventToAllRequestDtoActor
> = z.union([SubscriberPayloadDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TriggerEventToAllRequestDtoActor$ {
  /** @deprecated use `TriggerEventToAllRequestDtoActor$inboundSchema` instead. */
  export const inboundSchema = TriggerEventToAllRequestDtoActor$inboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDtoActor$outboundSchema` instead. */
  export const outboundSchema = TriggerEventToAllRequestDtoActor$outboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDtoActor$Outbound` instead. */
  export type Outbound = TriggerEventToAllRequestDtoActor$Outbound;
}

export function triggerEventToAllRequestDtoActorToJSON(
  triggerEventToAllRequestDtoActor: TriggerEventToAllRequestDtoActor,
): string {
  return JSON.stringify(
    TriggerEventToAllRequestDtoActor$outboundSchema.parse(
      triggerEventToAllRequestDtoActor,
    ),
  );
}

export function triggerEventToAllRequestDtoActorFromJSON(
  jsonString: string,
): SafeParseResult<TriggerEventToAllRequestDtoActor, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => TriggerEventToAllRequestDtoActor$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TriggerEventToAllRequestDtoActor' from JSON`,
  );
}

/** @internal */
export const TriggerEventToAllRequestDtoTenant$inboundSchema: z.ZodType<
  TriggerEventToAllRequestDtoTenant,
  z.ZodTypeDef,
  unknown
> = z.union([TenantPayloadDto$inboundSchema, z.string()]);

/** @internal */
export type TriggerEventToAllRequestDtoTenant$Outbound =
  | TenantPayloadDto$Outbound
  | string;

/** @internal */
export const TriggerEventToAllRequestDtoTenant$outboundSchema: z.ZodType<
  TriggerEventToAllRequestDtoTenant$Outbound,
  z.ZodTypeDef,
  TriggerEventToAllRequestDtoTenant
> = z.union([TenantPayloadDto$outboundSchema, z.string()]);

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TriggerEventToAllRequestDtoTenant$ {
  /** @deprecated use `TriggerEventToAllRequestDtoTenant$inboundSchema` instead. */
  export const inboundSchema = TriggerEventToAllRequestDtoTenant$inboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDtoTenant$outboundSchema` instead. */
  export const outboundSchema =
    TriggerEventToAllRequestDtoTenant$outboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDtoTenant$Outbound` instead. */
  export type Outbound = TriggerEventToAllRequestDtoTenant$Outbound;
}

export function triggerEventToAllRequestDtoTenantToJSON(
  triggerEventToAllRequestDtoTenant: TriggerEventToAllRequestDtoTenant,
): string {
  return JSON.stringify(
    TriggerEventToAllRequestDtoTenant$outboundSchema.parse(
      triggerEventToAllRequestDtoTenant,
    ),
  );
}

export function triggerEventToAllRequestDtoTenantFromJSON(
  jsonString: string,
): SafeParseResult<TriggerEventToAllRequestDtoTenant, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => TriggerEventToAllRequestDtoTenant$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TriggerEventToAllRequestDtoTenant' from JSON`,
  );
}

/** @internal */
export const TriggerEventToAllRequestDto$inboundSchema: z.ZodType<
  TriggerEventToAllRequestDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  name: z.string(),
  payload: z.record(z.any()),
  overrides: z.lazy(() => Overrides$inboundSchema).optional(),
  transactionId: z.string().optional(),
  actor: z.union([SubscriberPayloadDto$inboundSchema, z.string()]).optional(),
  tenant: z.union([TenantPayloadDto$inboundSchema, z.string()]).optional(),
});

/** @internal */
export type TriggerEventToAllRequestDto$Outbound = {
  name: string;
  payload: { [k: string]: any };
  overrides?: Overrides$Outbound | undefined;
  transactionId?: string | undefined;
  actor?: SubscriberPayloadDto$Outbound | string | undefined;
  tenant?: TenantPayloadDto$Outbound | string | undefined;
};

/** @internal */
export const TriggerEventToAllRequestDto$outboundSchema: z.ZodType<
  TriggerEventToAllRequestDto$Outbound,
  z.ZodTypeDef,
  TriggerEventToAllRequestDto
> = z.object({
  name: z.string(),
  payload: z.record(z.any()),
  overrides: z.lazy(() => Overrides$outboundSchema).optional(),
  transactionId: z.string().optional(),
  actor: z.union([SubscriberPayloadDto$outboundSchema, z.string()]).optional(),
  tenant: z.union([TenantPayloadDto$outboundSchema, z.string()]).optional(),
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace TriggerEventToAllRequestDto$ {
  /** @deprecated use `TriggerEventToAllRequestDto$inboundSchema` instead. */
  export const inboundSchema = TriggerEventToAllRequestDto$inboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDto$outboundSchema` instead. */
  export const outboundSchema = TriggerEventToAllRequestDto$outboundSchema;
  /** @deprecated use `TriggerEventToAllRequestDto$Outbound` instead. */
  export type Outbound = TriggerEventToAllRequestDto$Outbound;
}

export function triggerEventToAllRequestDtoToJSON(
  triggerEventToAllRequestDto: TriggerEventToAllRequestDto,
): string {
  return JSON.stringify(
    TriggerEventToAllRequestDto$outboundSchema.parse(
      triggerEventToAllRequestDto,
    ),
  );
}

export function triggerEventToAllRequestDtoFromJSON(
  jsonString: string,
): SafeParseResult<TriggerEventToAllRequestDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => TriggerEventToAllRequestDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'TriggerEventToAllRequestDto' from JSON`,
  );
}
