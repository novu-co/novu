/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import {
  MutationKey,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { NovuCore } from "../core.js";
import { subscribersPreferencesUpdateGlobal } from "../funcs/subscribersPreferencesUpdateGlobal.js";
import { combineSignals } from "../lib/primitives.js";
import { RequestOptions } from "../lib/sdks.js";
import * as components from "../models/components/index.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";
import { useNovuContext } from "./_context.js";
import { MutationHookOptions } from "./_types.js";

export type SubscribersPreferencesUpdateGlobalMutationVariables = {
  updateSubscriberGlobalPreferencesRequestDto:
    components.UpdateSubscriberGlobalPreferencesRequestDto;
  subscriberId: string;
  idempotencyKey?: string | undefined;
  options?: RequestOptions;
};

export type SubscribersPreferencesUpdateGlobalMutationData =
  operations.SubscribersV1ControllerUpdateSubscriberGlobalPreferencesResponse;

/**
 * Update subscriber global preferences
 */
export function useSubscribersPreferencesUpdateGlobalMutation(
  options?: MutationHookOptions<
    SubscribersPreferencesUpdateGlobalMutationData,
    Error,
    SubscribersPreferencesUpdateGlobalMutationVariables
  >,
): UseMutationResult<
  SubscribersPreferencesUpdateGlobalMutationData,
  Error,
  SubscribersPreferencesUpdateGlobalMutationVariables
> {
  const client = useNovuContext();
  return useMutation({
    ...buildSubscribersPreferencesUpdateGlobalMutation(client, options),
    ...options,
  });
}

export function mutationKeySubscribersPreferencesUpdateGlobal(): MutationKey {
  return ["@novu/api", "Preferences", "updateGlobal"];
}

export function buildSubscribersPreferencesUpdateGlobalMutation(
  client$: NovuCore,
  hookOptions?: RequestOptions,
): {
  mutationKey: MutationKey;
  mutationFn: (
    variables: SubscribersPreferencesUpdateGlobalMutationVariables,
  ) => Promise<SubscribersPreferencesUpdateGlobalMutationData>;
} {
  return {
    mutationKey: mutationKeySubscribersPreferencesUpdateGlobal(),
    mutationFn: function subscribersPreferencesUpdateGlobalMutationFn({
      updateSubscriberGlobalPreferencesRequestDto,
      subscriberId,
      idempotencyKey,
      options,
    }): Promise<SubscribersPreferencesUpdateGlobalMutationData> {
      const mergedOptions = {
        ...hookOptions,
        ...options,
        fetchOptions: {
          ...hookOptions?.fetchOptions,
          ...options?.fetchOptions,
          signal: combineSignals(
            hookOptions?.fetchOptions?.signal,
            options?.fetchOptions?.signal,
          ),
        },
      };
      return unwrapAsync(subscribersPreferencesUpdateGlobal(
        client$,
        updateSubscriberGlobalPreferencesRequestDto,
        subscriberId,
        idempotencyKey,
        mergedOptions,
      ));
    },
  };
}
