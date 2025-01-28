# SubscribersControllerBulkCreateSubscribersResponse

## Example Usage

```typescript
import { SubscribersControllerBulkCreateSubscribersResponse } from "@novu/api/models/operations";

let value: SubscribersControllerBulkCreateSubscribersResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    updated: [
      {
        subscriberId: "<id>",
      },
    ],
    created: [
      {
        subscriberId: "<id>",
      },
    ],
    failed: [
      {},
    ],
  },
};
```

## Fields

| Field                                                                                                    | Type                                                                                                     | Required                                                                                                 | Description                                                                                              |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `headers`                                                                                                | Record<string, *string*[]>                                                                               | :heavy_check_mark:                                                                                       | N/A                                                                                                      |
| `result`                                                                                                 | [components.BulkCreateSubscriberResponseDto](../../models/components/bulkcreatesubscriberresponsedto.md) | :heavy_check_mark:                                                                                       | N/A                                                                                                      |