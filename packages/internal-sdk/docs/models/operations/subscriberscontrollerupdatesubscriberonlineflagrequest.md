# SubscribersControllerUpdateSubscriberOnlineFlagRequest

## Example Usage

```typescript
import { SubscribersControllerUpdateSubscriberOnlineFlagRequest } from "@novu/api/models/operations";

let value: SubscribersControllerUpdateSubscriberOnlineFlagRequest = {
  subscriberId: "<id>",
  updateSubscriberOnlineFlagRequestDto: {
    isOnline: false,
  },
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `subscriberId`                                                                                                     | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `idempotencyKey`                                                                                                   | *string*                                                                                                           | :heavy_minus_sign:                                                                                                 | A header for idempotency purposes                                                                                  |
| `updateSubscriberOnlineFlagRequestDto`                                                                             | [components.UpdateSubscriberOnlineFlagRequestDto](../../models/components/updatesubscriberonlineflagrequestdto.md) | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |