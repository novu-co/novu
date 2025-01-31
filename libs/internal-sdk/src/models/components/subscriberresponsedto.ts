/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import * as z from "zod";
import { remap as remap$ } from "../../lib/primitives.js";
import { safeParse } from "../../lib/schemas.js";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import {
  ChannelSettingsDto,
  ChannelSettingsDto$inboundSchema,
  ChannelSettingsDto$Outbound,
  ChannelSettingsDto$outboundSchema,
} from "./channelsettingsdto.js";

export type SubscriberResponseDto = {
  /**
   * The internal ID generated by Novu for your subscriber. This ID does not match the `subscriberId` used in your queries. Refer to `subscriberId` for that identifier.
   */
  id?: string | undefined;
  /**
   * The first name of the subscriber.
   */
  firstName?: string | undefined;
  /**
   * The last name of the subscriber.
   */
  lastName?: string | undefined;
  /**
   * The email address of the subscriber.
   */
  email?: string | null | undefined;
  /**
   * The phone number of the subscriber.
   */
  phone?: string | undefined;
  /**
   * The URL of the subscriber's avatar image.
   */
  avatar?: string | undefined;
  /**
   * The locale setting of the subscriber, indicating their preferred language or region.
   */
  locale?: string | undefined;
  /**
   * The identifier used to create this subscriber, which typically corresponds to the user ID in your system.
   */
  subscriberId: string;
  /**
   * An array of channel settings associated with the subscriber.
   */
  channels?: Array<ChannelSettingsDto> | undefined;
  /**
   * An array of topics that the subscriber is subscribed to.
   *
   * @deprecated field: This will be removed in a future release, please migrate away from it as soon as possible.
   */
  topics?: Array<string> | undefined;
  /**
   * Indicates whether the subscriber is currently online.
   */
  isOnline?: boolean | undefined;
  /**
   * The timestamp indicating when the subscriber was last online, in ISO 8601 format.
   */
  lastOnlineAt?: string | undefined;
  /**
   * The unique identifier of the organization to which the subscriber belongs.
   */
  organizationId: string;
  /**
   * The unique identifier of the environment associated with this subscriber.
   */
  environmentId: string;
  /**
   * Indicates whether the subscriber has been deleted.
   */
  deleted: boolean;
  /**
   * The timestamp indicating when the subscriber was created, in ISO 8601 format.
   */
  createdAt: string;
  /**
   * The timestamp indicating when the subscriber was last updated, in ISO 8601 format.
   */
  updatedAt: string;
  /**
   * The version of the subscriber document.
   */
  v?: number | undefined;
  /**
   * Additional custom data for the subscriber
   */
  data?: { [k: string]: any } | null | undefined;

  /**
   * Timezone of the subscriber
   */
  timezone?: string | undefined;
};

/** @internal */
export const SubscriberResponseDto$inboundSchema: z.ZodType<
  SubscriberResponseDto,
  z.ZodTypeDef,
  unknown
> = z.object({
  _id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.nullable(z.string()).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  locale: z.string().optional(),
  subscriberId: z.string(),
  channels: z.array(ChannelSettingsDto$inboundSchema).optional(),
  topics: z.array(z.string()).optional(),
  isOnline: z.boolean().optional(),
  lastOnlineAt: z.string().optional(),
  _organizationId: z.string(),
  _environmentId: z.string(),
  deleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  __v: z.number().optional(),
  data: z.nullable(z.record(z.any())).optional(),
}).transform((v) => {
  return remap$(v, {
    "_id": "id",
    "_organizationId": "organizationId",
    "_environmentId": "environmentId",
    "__v": "v",
  });
});

/** @internal */
export type SubscriberResponseDto$Outbound = {
  _id?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | null | undefined;
  phone?: string | undefined;
  avatar?: string | undefined;
  locale?: string | undefined;
  subscriberId: string;
  channels?: Array<ChannelSettingsDto$Outbound> | undefined;
  topics?: Array<string> | undefined;
  isOnline?: boolean | undefined;
  lastOnlineAt?: string | undefined;
  _organizationId: string;
  _environmentId: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number | undefined;
  data?: { [k: string]: any } | null | undefined;
};

/** @internal */
export const SubscriberResponseDto$outboundSchema: z.ZodType<
  SubscriberResponseDto$Outbound,
  z.ZodTypeDef,
  SubscriberResponseDto
> = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.nullable(z.string()).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  locale: z.string().optional(),
  subscriberId: z.string(),
  channels: z.array(ChannelSettingsDto$outboundSchema).optional(),
  topics: z.array(z.string()).optional(),
  isOnline: z.boolean().optional(),
  lastOnlineAt: z.string().optional(),
  organizationId: z.string(),
  environmentId: z.string(),
  deleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  v: z.number().optional(),
  data: z.nullable(z.record(z.any())).optional(),
}).transform((v) => {
  return remap$(v, {
    id: "_id",
    organizationId: "_organizationId",
    environmentId: "_environmentId",
    v: "__v",
  });
});

/**
 * @internal
 * @deprecated This namespace will be removed in future versions. Use schemas and types that are exported directly from this module.
 */
export namespace SubscriberResponseDto$ {
  /** @deprecated use `SubscriberResponseDto$inboundSchema` instead. */
  export const inboundSchema = SubscriberResponseDto$inboundSchema;
  /** @deprecated use `SubscriberResponseDto$outboundSchema` instead. */
  export const outboundSchema = SubscriberResponseDto$outboundSchema;
  /** @deprecated use `SubscriberResponseDto$Outbound` instead. */
  export type Outbound = SubscriberResponseDto$Outbound;
}

export function subscriberResponseDtoToJSON(
  subscriberResponseDto: SubscriberResponseDto,
): string {
  return JSON.stringify(
    SubscriberResponseDto$outboundSchema.parse(subscriberResponseDto),
  );
}

export function subscriberResponseDtoFromJSON(
  jsonString: string,
): SafeParseResult<SubscriberResponseDto, SDKValidationError> {
  return safeParse(
    jsonString,
    (x) => SubscriberResponseDto$inboundSchema.parse(JSON.parse(x)),
    `Failed to parse 'SubscriberResponseDto' from JSON`,
  );
}
