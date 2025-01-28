# SubscribersV1ControllerGetSubscriberRequest

## Example Usage

```typescript
import { SubscribersV1ControllerGetSubscriberRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerGetSubscriberRequest = {
  subscriberId: "<id>",
};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `subscriberId`                                     | *string*                                           | :heavy_check_mark:                                 | N/A                                                |
| `includeTopics`                                    | *boolean*                                          | :heavy_minus_sign:                                 | Includes the topics associated with the subscriber |
| `idempotencyKey`                                   | *string*                                           | :heavy_minus_sign:                                 | A header for idempotency purposes                  |