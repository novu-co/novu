# Preferences
(*subscribers.preferences*)

## Overview

### Available Operations

* [list](#list) - Get subscriber preferences
* [updateGlobal](#updateglobal) - Update subscriber global preferences
* [retrieveByLevel](#retrievebylevel) - Get subscriber preferences by level
* [update](#update) - Update subscriber preference

## list

Get subscriber preferences

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.preferences.list("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { subscribersPreferencesList } from "@novu/api/funcs/subscribersPreferencesList.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersPreferencesList(novu, "<id>");

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
  useSubscribersPreferencesList,
  useSubscribersPreferencesListSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchSubscribersPreferencesList,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateSubscribersPreferencesList,
  invalidateAllSubscribersPreferencesList,
} from "@novu/api/react-query/subscribersPreferencesList.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscriberId`                                                                                                                                                                 | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `includeInactiveChannels`                                                                                                                                                      | *boolean*                                                                                                                                                                      | :heavy_minus_sign:                                                                                                                                                             | A flag which specifies if the inactive workflow channels should be included in the retrieved preferences. Default is true                                                      |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerListSubscriberPreferencesResponse](../../models/operations/subscriberscontrollerlistsubscriberpreferencesresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## updateGlobal

Update subscriber global preferences

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.preferences.updateGlobal({}, "<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { subscribersPreferencesUpdateGlobal } from "@novu/api/funcs/subscribersPreferencesUpdateGlobal.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersPreferencesUpdateGlobal(novu, {}, "<id>");

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
  // Mutation hook for triggering the API call.
  useSubscribersPreferencesUpdateGlobalMutation
} from "@novu/api/react-query/subscribersPreferencesUpdateGlobal.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `subscriberId`                                                                                                                                                                 | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `updateSubscriberGlobalPreferencesRequestDto`                                                                                                                                  | [components.UpdateSubscriberGlobalPreferencesRequestDto](../../models/components/updatesubscriberglobalpreferencesrequestdto.md)                                               | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerUpdateSubscriberGlobalPreferencesResponse](../../models/operations/subscriberscontrollerupdatesubscriberglobalpreferencesresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## retrieveByLevel

Get subscriber preferences by level

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.preferences.retrieveByLevel({
    preferenceLevel: "template",
    subscriberId: "<id>",
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { subscribersPreferencesRetrieveByLevel } from "@novu/api/funcs/subscribersPreferencesRetrieveByLevel.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersPreferencesRetrieveByLevel(novu, {
    preferenceLevel: "template",
    subscriberId: "<id>",
  });

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
  useSubscribersPreferencesRetrieveByLevel,
  useSubscribersPreferencesRetrieveByLevelSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchSubscribersPreferencesRetrieveByLevel,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateSubscribersPreferencesRetrieveByLevel,
  invalidateAllSubscribersPreferencesRetrieveByLevel,
} from "@novu/api/react-query/subscribersPreferencesRetrieveByLevel.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SubscribersControllerGetSubscriberPreferenceByLevelRequest](../../models/operations/subscriberscontrollergetsubscriberpreferencebylevelrequest.md)                 | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerGetSubscriberPreferenceByLevelResponse](../../models/operations/subscriberscontrollergetsubscriberpreferencebylevelresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## update

Update subscriber preference

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.preferences.update({
    subscriberId: "<id>",
    workflowId: "<id>",
    updateSubscriberPreferenceRequestDto: {},
  });

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { subscribersPreferencesUpdate } from "@novu/api/funcs/subscribersPreferencesUpdate.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersPreferencesUpdate(novu, {
    subscriberId: "<id>",
    workflowId: "<id>",
    updateSubscriberPreferenceRequestDto: {},
  });

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
  // Mutation hook for triggering the API call.
  useSubscribersPreferencesUpdateMutation
} from "@novu/api/react-query/subscribersPreferencesUpdate.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SubscribersControllerUpdateSubscriberPreferenceRequest](../../models/operations/subscriberscontrollerupdatesubscriberpreferencerequest.md)                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerUpdateSubscriberPreferenceResponse](../../models/operations/subscriberscontrollerupdatesubscriberpreferenceresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |