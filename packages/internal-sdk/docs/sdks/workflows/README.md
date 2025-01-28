# Workflows
(*workflows*)

## Overview

All notifications are sent via a workflow. Each workflow acts as a container for the logic and blueprint that are associated with a type of notification in your system.
<https://docs.novu.co/workflows>

### Available Operations

* [create](#create)
* [workflowControllerSearchWorkflows](#workflowcontrollersearchworkflows)
* [workflowControllerSync](#workflowcontrollersync)
* [update](#update)
* [retrieve](#retrieve)
* [delete](#delete)
* [workflowControllerPatchWorkflow](#workflowcontrollerpatchworkflow)
* [workflowControllerGeneratePreview](#workflowcontrollergeneratepreview)
* [getStepData](#getstepdata)
* [workflowControllerPatchWorkflowStepData](#workflowcontrollerpatchworkflowstepdata)
* [getWorkflowTestData](#getworkflowtestdata)

## create

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.create();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsCreate } from "@novu/api/funcs/workflowsCreate.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsCreate(novu);

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
  useWorkflowsCreateMutation
} from "@novu/api/react-query/workflowsCreate.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerCreateResponse](../../models/operations/workflowcontrollercreateresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## workflowControllerSearchWorkflows

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.workflowControllerSearchWorkflows();

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsWorkflowControllerSearchWorkflows } from "@novu/api/funcs/workflowsWorkflowControllerSearchWorkflows.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsWorkflowControllerSearchWorkflows(novu);

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
  useWorkflowsWorkflowControllerSearchWorkflows,
  useWorkflowsWorkflowControllerSearchWorkflowsSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchWorkflowsWorkflowControllerSearchWorkflows,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateWorkflowsWorkflowControllerSearchWorkflows,
  invalidateAllWorkflowsWorkflowControllerSearchWorkflows,
} from "@novu/api/react-query/workflowsWorkflowControllerSearchWorkflows.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerSearchWorkflowsResponse](../../models/operations/workflowcontrollersearchworkflowsresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## workflowControllerSync

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.workflowControllerSync("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsWorkflowControllerSync } from "@novu/api/funcs/workflowsWorkflowControllerSync.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsWorkflowControllerSync(novu, "<id>");

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
  useWorkflowsWorkflowControllerSyncMutation
} from "@novu/api/react-query/workflowsWorkflowControllerSync.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerSyncResponse](../../models/operations/workflowcontrollersyncresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## update

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.update("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsUpdate } from "@novu/api/funcs/workflowsUpdate.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsUpdate(novu, "<id>");

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
  useWorkflowsUpdateMutation
} from "@novu/api/react-query/workflowsUpdate.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerUpdateResponse](../../models/operations/workflowcontrollerupdateresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## retrieve

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.retrieve("<id>", "<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsRetrieve } from "@novu/api/funcs/workflowsRetrieve.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsRetrieve(novu, "<id>", "<id>");

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
  useWorkflowsRetrieve,
  useWorkflowsRetrieveSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchWorkflowsRetrieve,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateWorkflowsRetrieve,
  invalidateAllWorkflowsRetrieve,
} from "@novu/api/react-query/workflowsRetrieve.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `environmentId`                                                                                                                                                                | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerGetWorkflowResponse](../../models/operations/workflowcontrollergetworkflowresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## delete

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.delete("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsDelete } from "@novu/api/funcs/workflowsDelete.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsDelete(novu, "<id>");

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
  useWorkflowsDeleteMutation
} from "@novu/api/react-query/workflowsDelete.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerRemoveWorkflowResponse](../../models/operations/workflowcontrollerremoveworkflowresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## workflowControllerPatchWorkflow

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.workflowControllerPatchWorkflow("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsWorkflowControllerPatchWorkflow } from "@novu/api/funcs/workflowsWorkflowControllerPatchWorkflow.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsWorkflowControllerPatchWorkflow(novu, "<id>");

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
  useWorkflowsWorkflowControllerPatchWorkflowMutation
} from "@novu/api/react-query/workflowsWorkflowControllerPatchWorkflow.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerPatchWorkflowResponse](../../models/operations/workflowcontrollerpatchworkflowresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## workflowControllerGeneratePreview

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.workflowControllerGeneratePreview("<id>", "<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsWorkflowControllerGeneratePreview } from "@novu/api/funcs/workflowsWorkflowControllerGeneratePreview.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsWorkflowControllerGeneratePreview(novu, "<id>", "<id>");

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
  useWorkflowsWorkflowControllerGeneratePreviewMutation
} from "@novu/api/react-query/workflowsWorkflowControllerGeneratePreview.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `stepId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerGeneratePreviewResponse](../../models/operations/workflowcontrollergeneratepreviewresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## getStepData

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.getStepData("<id>", "<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsGetStepData } from "@novu/api/funcs/workflowsGetStepData.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsGetStepData(novu, "<id>", "<id>");

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
  useWorkflowsGetStepData,
  useWorkflowsGetStepDataSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchWorkflowsGetStepData,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateWorkflowsGetStepData,
  invalidateAllWorkflowsGetStepData,
} from "@novu/api/react-query/workflowsGetStepData.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `stepId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerGetWorkflowStepDataResponse](../../models/operations/workflowcontrollergetworkflowstepdataresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## workflowControllerPatchWorkflowStepData

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.workflowControllerPatchWorkflowStepData("<id>", "<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsWorkflowControllerPatchWorkflowStepData } from "@novu/api/funcs/workflowsWorkflowControllerPatchWorkflowStepData.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsWorkflowControllerPatchWorkflowStepData(novu, "<id>", "<id>");

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
  useWorkflowsWorkflowControllerPatchWorkflowStepDataMutation
} from "@novu/api/react-query/workflowsWorkflowControllerPatchWorkflowStepData.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `stepId`                                                                                                                                                                       | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerPatchWorkflowStepDataResponse](../../models/operations/workflowcontrollerpatchworkflowstepdataresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |

## getWorkflowTestData

### Example Usage

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.workflows.getWorkflowTestData("<id>");

  // Handle the result
  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { NovuCore } from "@novu/api/core.js";
import { workflowsGetWorkflowTestData } from "@novu/api/funcs/workflowsGetWorkflowTestData.js";

// Use `NovuCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const novu = new NovuCore({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const res = await workflowsGetWorkflowTestData(novu, "<id>");

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
  useWorkflowsGetWorkflowTestData,
  useWorkflowsGetWorkflowTestDataSuspense,

  // Utility for prefetching data during server-side rendering and in React
  // Server Components that will be immediately available to client components
  // using the hooks.
  prefetchWorkflowsGetWorkflowTestData,
  
  // Utilities to invalidate the query cache for this query in response to
  // mutations and other user actions.
  invalidateWorkflowsGetWorkflowTestData,
  invalidateAllWorkflowsGetWorkflowTestData,
} from "@novu/api/react-query/workflowsGetWorkflowTestData.js";
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `workflowId`                                                                                                                                                                   | *string*                                                                                                                                                                       | :heavy_check_mark:                                                                                                                                                             | N/A                                                                                                                                                                            |
| `idempotencyKey`                                                                                                                                                               | *string*                                                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                             | A header for idempotency purposes                                                                                                                                              |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.WorkflowControllerGetWorkflowTestDataResponse](../../models/operations/workflowcontrollergetworkflowtestdataresponse.md)\>**

### Errors

| Error Type                             | Status Code                            | Content Type                           |
| -------------------------------------- | -------------------------------------- | -------------------------------------- |
| errors.ErrorDto                        | 400, 401, 403, 404, 405, 409, 413, 415 | application/json                       |
| errors.ErrorDto                        | 414                                    | application/json                       |
| errors.ValidationErrorDto              | 422                                    | application/json                       |
| errors.ErrorDto                        | 500                                    | application/json                       |
| errors.SDKError                        | 4XX, 5XX                               | \*/\*                                  |