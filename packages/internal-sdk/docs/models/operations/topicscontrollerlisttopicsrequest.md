# TopicsControllerListTopicsRequest

## Example Usage

```typescript
import { TopicsControllerListTopicsRequest } from "@novu/api/models/operations";

let value: TopicsControllerListTopicsRequest = {
  page: 0,
  pageSize: 10,
  key: "exampleKey",
};
```

## Fields

| Field                                                | Type                                                 | Required                                             | Description                                          | Example                                              |
| ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| `page`                                               | *number*                                             | :heavy_minus_sign:                                   | The page number to retrieve (starts from 0)          | 0                                                    |
| `pageSize`                                           | *number*                                             | :heavy_minus_sign:                                   | The number of items to return per page (default: 10) | 10                                                   |
| `key`                                                | *string*                                             | :heavy_minus_sign:                                   | A filter key to apply to the results                 | exampleKey                                           |
| `idempotencyKey`                                     | *string*                                             | :heavy_minus_sign:                                   | A header for idempotency purposes                    |                                                      |