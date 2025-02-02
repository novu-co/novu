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
import { notificationsRetrieve } from "../funcs/notificationsRetrieve.js";
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

export type NotificationsRetrieveQueryData =
  operations.NotificationsControllerGetNotificationResponse;

/**
 * Get notification
 */
export function useNotificationsRetrieve(
  notificationId: string,
  idempotencyKey?: string | undefined,
  options?: QueryHookOptions<NotificationsRetrieveQueryData>,
): UseQueryResult<NotificationsRetrieveQueryData, Error> {
  const client = useNovuContext();
  return useQuery({
    ...buildNotificationsRetrieveQuery(
      client,
      notificationId,
      idempotencyKey,
      options,
    ),
    ...options,
  });
}

/**
 * Get notification
 */
export function useNotificationsRetrieveSuspense(
  notificationId: string,
  idempotencyKey?: string | undefined,
  options?: SuspenseQueryHookOptions<NotificationsRetrieveQueryData>,
): UseSuspenseQueryResult<NotificationsRetrieveQueryData, Error> {
  const client = useNovuContext();
  return useSuspenseQuery({
    ...buildNotificationsRetrieveQuery(
      client,
      notificationId,
      idempotencyKey,
      options,
    ),
    ...options,
  });
}

export function prefetchNotificationsRetrieve(
  queryClient: QueryClient,
  client$: NovuCore,
  notificationId: string,
  idempotencyKey?: string | undefined,
): Promise<void> {
  return queryClient.prefetchQuery({
    ...buildNotificationsRetrieveQuery(
      client$,
      notificationId,
      idempotencyKey,
    ),
  });
}

export function setNotificationsRetrieveData(
  client: QueryClient,
  queryKeyBase: [
    notificationId: string,
    parameters: { idempotencyKey?: string | undefined },
  ],
  data: NotificationsRetrieveQueryData,
): NotificationsRetrieveQueryData | undefined {
  const key = queryKeyNotificationsRetrieve(...queryKeyBase);

  return client.setQueryData<NotificationsRetrieveQueryData>(key, data);
}

export function invalidateNotificationsRetrieve(
  client: QueryClient,
  queryKeyBase: TupleToPrefixes<
    [
      notificationId: string,
      parameters: { idempotencyKey?: string | undefined },
    ]
  >,
  filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">,
): Promise<void> {
  return client.invalidateQueries({
    ...filters,
    queryKey: ["@novu/api", "Notifications", "retrieve", ...queryKeyBase],
  });
}

export function invalidateAllNotificationsRetrieve(
  client: QueryClient,
  filters?: Omit<InvalidateQueryFilters, "queryKey" | "predicate" | "exact">,
): Promise<void> {
  return client.invalidateQueries({
    ...filters,
    queryKey: ["@novu/api", "Notifications", "retrieve"],
  });
}

export function buildNotificationsRetrieveQuery(
  client$: NovuCore,
  notificationId: string,
  idempotencyKey?: string | undefined,
  options?: RequestOptions,
): {
  queryKey: QueryKey;
  queryFn: (
    context: QueryFunctionContext,
  ) => Promise<NotificationsRetrieveQueryData>;
} {
  return {
    queryKey: queryKeyNotificationsRetrieve(notificationId, { idempotencyKey }),
    queryFn: async function notificationsRetrieveQueryFn(
      ctx,
    ): Promise<NotificationsRetrieveQueryData> {
      const sig = combineSignals(ctx.signal, options?.fetchOptions?.signal);
      const mergedOptions = {
        ...options,
        fetchOptions: { ...options?.fetchOptions, signal: sig },
      };

      return unwrapAsync(notificationsRetrieve(
        client$,
        notificationId,
        idempotencyKey,
        mergedOptions,
      ));
    },
  };
}

export function queryKeyNotificationsRetrieve(
  notificationId: string,
  parameters: { idempotencyKey?: string | undefined },
): QueryKey {
  return ["@novu/api", "Notifications", "retrieve", notificationId, parameters];
}
