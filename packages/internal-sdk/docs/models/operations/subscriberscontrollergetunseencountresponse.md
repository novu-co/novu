# SubscribersControllerGetUnseenCountResponse

## Example Usage

```typescript
import { SubscribersControllerGetUnseenCountResponse } from "@novu/api/models/operations";

let value: SubscribersControllerGetUnseenCountResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    count: 9883.74,
  },
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `headers`                                                                        | Record<string, *string*[]>                                                       | :heavy_check_mark:                                                               | N/A                                                                              |
| `result`                                                                         | [components.UnseenCountResponse](../../models/components/unseencountresponse.md) | :heavy_check_mark:                                                               | N/A                                                                              |