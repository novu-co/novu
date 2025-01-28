# SubscribersControllerGetSubscriberRequest

## Example Usage

```typescript
import { SubscribersControllerGetSubscriberRequest } from "@novu/api/models/operations";

let value: SubscribersControllerGetSubscriberRequest = {
  subscriberId: "<id>",
};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `subscriberId`                                     | *string*                                           | :heavy_check_mark:                                 | N/A                                                |
| `includeTopics`                                    | *boolean*                                          | :heavy_minus_sign:                                 | Includes the topics associated with the subscriber |
| `idempotencyKey`                                   | *string*                                           | :heavy_minus_sign:                                 | A header for idempotency purposes                  |