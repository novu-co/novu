# SubscribersControllerSearchSubscribersRequest

## Example Usage

```typescript
import { SubscribersControllerSearchSubscribersRequest } from "@novu/api/models/operations";

let value: SubscribersControllerSearchSubscribersRequest = {};
```

## Fields

| Field                                                                             | Type                                                                              | Required                                                                          | Description                                                                       |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `after`                                                                           | *string*                                                                          | :heavy_minus_sign:                                                                | Cursor for pagination indicating the starting point after which to fetch results. |
| `before`                                                                          | *string*                                                                          | :heavy_minus_sign:                                                                | Cursor for pagination indicating the ending point before which to fetch results.  |
| `email`                                                                           | *string*                                                                          | :heavy_minus_sign:                                                                | Email address of the subscriber to filter results.                                |
| `name`                                                                            | *string*                                                                          | :heavy_minus_sign:                                                                | Name of the subscriber to filter results.                                         |
| `phone`                                                                           | *string*                                                                          | :heavy_minus_sign:                                                                | Phone number of the subscriber to filter results.                                 |
| `subscriberId`                                                                    | *string*                                                                          | :heavy_minus_sign:                                                                | Unique identifier of the subscriber to filter results.                            |
| `limit`                                                                           | *number*                                                                          | :heavy_minus_sign:                                                                | N/A                                                                               |
| `orderDirection`                                                                  | [operations.OrderDirection](../../models/operations/orderdirection.md)            | :heavy_minus_sign:                                                                | N/A                                                                               |
| `orderBy`                                                                         | *any*                                                                             | :heavy_minus_sign:                                                                | N/A                                                                               |
| `idempotencyKey`                                                                  | *string*                                                                          | :heavy_minus_sign:                                                                | A header for idempotency purposes                                                 |