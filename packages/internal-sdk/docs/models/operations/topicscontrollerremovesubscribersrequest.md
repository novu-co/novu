# TopicsControllerRemoveSubscribersRequest

## Example Usage

```typescript
import { TopicsControllerRemoveSubscribersRequest } from "@novu/api/models/operations";

let value: TopicsControllerRemoveSubscribersRequest = {
  topicKey: "<value>",
  removeSubscribersRequestDto: {
    subscribers: [
      "<value>",
    ],
  },
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `topicKey`                                                                                       | *string*                                                                                         | :heavy_check_mark:                                                                               | The topic key                                                                                    |
| `idempotencyKey`                                                                                 | *string*                                                                                         | :heavy_minus_sign:                                                                               | A header for idempotency purposes                                                                |
| `removeSubscribersRequestDto`                                                                    | [components.RemoveSubscribersRequestDto](../../models/components/removesubscribersrequestdto.md) | :heavy_check_mark:                                                                               | N/A                                                                                              |