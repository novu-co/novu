/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import {
  InvalidateQueryFilters,
  QueryClient,
  QueryFunctionContext,
  QueryKey,
  useQuery,
  UseQueryResult,
  useSuspenseQuery,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { NovuCore } from "../core.js";
import { subscribersRetrieve } from "../funcs/subscribersRetrieve.js";
import { combineSignals } from "../lib/primitives.js";
import { RequestOptions } from "../lib/sdks.js";
import * as operations from "../models/operations/index.js";
import { unwrapAsync } from "../types/fp.js";
import { useNovuContext } from "./_context.js";
import {
  QueryHookOptions,
  SuspenseQueryHookOptions,
  TupleToPrefixes,
} from "./_types.js";

export type SubscribersRetrieveQueryData =
  operations.SubscribersV1ControllerGetSubscriberResponse;

/**
 * Get subscriber
 *
 * @remarks
 * Get subscriber by your internal id used to identify the subscriber
 */
export function useSubscribersRetrieve(
  subscriberId: string,
  includeTopics?: boolean | undefined,
  idempotencyKey?: string | undefined,
  options?: QueryHookOptions<SubscribersRetrieveQueryData>,
): UseQueryResult<SubscribersRetrieveQueryData, Error> {
  const client = useNovuContext();
  return useQuery({
    ...buildSubscribersRetrieveQuery(
      client,
      subscriberId,
      includeTopics,
      idempotencyKey,
      options,
    ),
    ...options,
  });
}

/**
 * Get subscriber
 *
 * @remarks
 * Get subscriber by your internal id used to identify the subscriber
 */
export function useSubscribersRetrieveSuspense(
  subscriberId: string,
  includeTopics?: boolean | undefined,
  idempotencyKey?: string | undefined,
  options?: SuspenseQueryHookOptions<SubscribersRetrieveQueryData>,
): UseSuspenseQueryResult<SubscribersRetrieveQueryData, Error> {
  const client = useNovuContext();
  return useSuspenseQuery({
    ...buildSubscribersRetrieveQuery(
      client,
      subscriberId,
      includeTopics,
      idempotencyKey,
      options,
    ),
    ...options,
  });
}

export function prefetchSubscribersRetrieve(
  queryClient: QueryClient,
  client$: NovuCore,
  subscriberId: string,
  includeTopics?: boolean | undefined,
  idempotencyKey?: string | undefined,
): Promise<void> {
  return queryClient.prefetchQuery({
    ...buildSubscribersRetrieveQuery(
      client$,
      subscriberId,
      includeTopics,
      idempotencyKey,
    ),
  });
}

export function setSubscribersRetrieveData(
  client: QueryClient,
  queryKeyBase: [
    subscriberId: string,
    parameters: {
      includeTopics?: boolean | undefined;
      idempotencyKey?: string | undefined;
    },
  ],
  data: SubscribersRetrieveQueryData,
): SubscribersRetrieveQueryData | undefined {
  const key = queryKeySubscribersRetrieve(...queryKeyBase);

  return client.setQueryData<SubscribersRetrieveQueryData>(key, data);
}

export function invalidateSubscribersRetrieve(
  client: QueryClient,
  queryKeyBase: TupleToPrefixes<
    [
      subscriberId: string,
      parameters: {
        includeTopics?: boolean | undefined;
        idempotencyKey?: string | undefined;
      },
    ]
  >,
  filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">,
): Promise<void> {
  return client.invalidateQueries({
    ...filters,
    queryKey: ["@novu/api", "Subscribers", "retrieve", ...queryKeyBase],
  });
}

export function invalidateAllSubscribersRetrieve(
  client: QueryClient,
  filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">,
): Promise<void> {
  return client.invalidateQueries({
    ...filters,
    queryKey: ["@novu/api", "Subscribers", "retrieve"],
  });
}

export function buildSubscribersRetrieveQuery(
  client$: NovuCore,
  subscriberId: string,
  includeTopics?: boolean | undefined,
  idempotencyKey?: string | undefined,
  options?: RequestOptions,
): {
  queryKey: QueryKey;
  queryFn: (
    context: QueryFunctionContext,
  ) => Promise<SubscribersRetrieveQueryData>;
} {
  return {
    queryKey: queryKeySubscribersRetrieve(subscriberId, {
      includeTopics,
      idempotencyKey,
    }),
    queryFn: async function subscribersRetrieveQueryFn(
      ctx,
    ): Promise<SubscribersRetrieveQueryData> {
      const sig = combineSignals(ctx.signal, options?.fetchOptions?.signal);
      const mergedOptions = {
        ...options,
        fetchOptions: { ...options?.fetchOptions, signal: sig },
      };

      return unwrapAsync(subscribersRetrieve(
        client$,
        subscriberId,
        includeTopics,
        idempotencyKey,
        mergedOptions,
      ));
    },
  };
}

export function queryKeySubscribersRetrieve(
  subscriberId: string,
  parameters: {
    includeTopics?: boolean | undefined;
    idempotencyKey?: string | undefined;
  },
): QueryKey {
  return ["@novu/api", "Subscribers", "retrieve", subscriberId, parameters];
}
