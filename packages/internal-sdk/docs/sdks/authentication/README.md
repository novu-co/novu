# Authentication
(*subscribers.authentication*)

## Overview

### Available Operations

* [chatAccessOauthCallBack](#chataccessoauthcallback) - Handle providers oauth redirect
* [chatAccessOauth](#chataccessoauth) - Handle chat oauth

## chatAccessOauthCallBack

Handle providers oauth redirect

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.authentication.chatAccessOauthCallBack({
    subscriberId: "<id>",
    providerId: "<id>",
    hmacHash: "<value>",
    environmentId: "<id>",
    code: "<value>",
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
import { subscribersAuthenticationChatAccessOauthCallBack } from "@novu/api/funcs/subscribersAuthenticationChatAccessOauthCallBack.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersAuthenticationChatAccessOauthCallBack(novu, {
    subscriberId: "<id>",
    providerId: "<id>",
    hmacHash: "<value>",
    environmentId: "<id>",
    code: "<value>",
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
  useSubscribersAuthenticationChatAccessOauthCallBack,
  useSubscribersAuthenticationChatAccessOauthCallBackSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchSubscribersAuthenticationChatAccessOauthCallBack,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateSubscribersAuthenticationChatAccessOauthCallBack,
  invalidateAllSubscribersAuthenticationChatAccessOauthCallBack,
} from "@novu/api/react-query/subscribersAuthenticationChatAccessOauthCallBack.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SubscribersControllerChatOauthCallbackRequest](../../models/operations/subscriberscontrollerchatoauthcallbackrequest.md)                                           | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerChatOauthCallbackResponse](../../models/operations/subscriberscontrollerchatoauthcallbackresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## chatAccessOauth

Handle chat oauth

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.authentication.chatAccessOauth({
    subscriberId: "<id>",
    providerId: "<id>",
    hmacHash: "<value>",
    environmentId: "<id>",
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
import { subscribersAuthenticationChatAccessOauth } from "@novu/api/funcs/subscribersAuthenticationChatAccessOauth.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await subscribersAuthenticationChatAccessOauth(novu, {
    subscriberId: "<id>",
    providerId: "<id>",
    hmacHash: "<value>",
    environmentId: "<id>",
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
  useSubscribersAuthenticationChatAccessOauth,
  useSubscribersAuthenticationChatAccessOauthSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchSubscribersAuthenticationChatAccessOauth,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateSubscribersAuthenticationChatAccessOauth,
  invalidateAllSubscribersAuthenticationChatAccessOauth,
} from "@novu/api/react-query/subscribersAuthenticationChatAccessOauth.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.SubscribersControllerChatAccessOauthRequest](../../models/operations/subscriberscontrollerchataccessoauthrequest.md)                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.SubscribersControllerChatAccessOauthResponse](../../models/operations/subscriberscontrollerchataccessoauthresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |