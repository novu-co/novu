# SubscribersControllerBulkCreateSubscribersRequest

## Example Usage

```typescript
import { SubscribersControllerBulkCreateSubscribersRequest } from "@novu/api/models/operations";

let value: SubscribersControllerBulkCreateSubscribersRequest = {
  bulkSubscriberCreateDto: {
    subscribers: [
      {
        subscriberId: "<id>",
      },
    ],
  },
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `idempotencyKey`                                                                         | *string*                                                                                 | :heavy_minus_sign:                                                                       | A header for idempotency purposes                                                        |
| `bulkSubscriberCreateDto`                                                                | [components.BulkSubscriberCreateDto](../../models/components/bulksubscribercreatedto.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |