# Stats
(*notifications.stats*)

## Overview

### Available Operations

* [retrieve](#retrieve) - Get notification statistics
* [graph](#graph) - Get notification graph statistics

## retrieve

Get notification statistics

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.notifications.stats.retrieve();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { notificationsStatsRetrieve } from "@novu/api/funcs/notificationsStatsRetrieve.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await notificationsStatsRetrieve(novu);

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### React hooks and utilities

This method can be used in React components through the following hooks and
associated utilities.

> Check out [this guide][hook-guide] for information about each of the utilities
> below and how to get started using React hooks.

[hook-guide]: ../../../REACT_QUERY.md

```tsx
import {
  // Query hooks for fetching data.
  useNotificationsStatsRetrieve,
  useNotificationsStatsRetrieveSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchNotificationsStatsRetrieve,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateNotificationsStatsRetrieve,
  invalidateAllNotificationsStatsRetrieve,
} from "@novu/api/react-query/notificationsStatsRetrieve.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.NotificationsControllerGetActivityStatsResponse](../../models/operations/notificationscontrollergetactivitystatsresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## graph

Get notification graph statistics

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.notifications.stats.graph();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { notificationsStatsGraph } from "@novu/api/funcs/notificationsStatsGraph.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await notificationsStatsGraph(novu);

  if (!res.ok) {
    throw res.error;
  }

  const { value: result } = res;

  // Handle the result
  console.log(result);
}

run();
```

### React hooks and utilities

This method can be used in React components through the following hooks and
associated utilities.

> Check out [this guide][hook-guide] for information about each of the utilities
> below and how to get started using React hooks.

[hook-guide]: ../../../REACT_QUERY.md

```tsx
import {
  // Query hooks for fetching data.
  useNotificationsStatsGraph,
  useNotificationsStatsGraphSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchNotificationsStatsGraph,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateNotificationsStatsGraph,
  invalidateAllNotificationsStatsGraph,
} from "@novu/api/react-query/notificationsStatsGraph.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `days`                                                                                                                                                                         | *number*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.NotificationsControllerGetActivityGraphStatsResponse](../../models/operations/notificationscontrollergetactivitygraphstatsresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |