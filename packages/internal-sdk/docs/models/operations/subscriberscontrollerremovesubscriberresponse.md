# SubscribersControllerRemoveSubscriberResponse

## Example Usage

```typescript
import { SubscribersControllerRemoveSubscriberResponse } from "@novu/api/models/operations";

let value: SubscribersControllerRemoveSubscriberResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    acknowledged: false,
    status: "deleted",
  },
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `headers`                                                                                        | Record<string, *string*[]>                                                                       | :heavy_check_mark:                                                                               | N/A                                                                                              |
| `result`                                                                                         | [components.DeleteSubscriberResponseDto](../../models/components/deletesubscriberresponsedto.md) | :heavy_check_mark:                                                                               | N/A                                                                                              |