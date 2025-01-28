# SubscribersV1ControllerRemoveSubscriberResponse

## Example Usage

```typescript
import { SubscribersV1ControllerRemoveSubscriberResponse } from "@novu/api/models/operations";

let value: SubscribersV1ControllerRemoveSubscriberResponse = {
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