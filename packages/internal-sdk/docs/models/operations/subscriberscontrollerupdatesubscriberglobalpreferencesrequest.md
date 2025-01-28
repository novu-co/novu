# SubscribersControllerUpdateSubscriberGlobalPreferencesRequest

## Example Usage

```typescript
import { SubscribersControllerUpdateSubscriberGlobalPreferencesRequest } from "@novu/api/models/operations";

let value: SubscribersControllerUpdateSubscriberGlobalPreferencesRequest = {
  subscriberId: "<id>",
  updateSubscriberGlobalPreferencesRequestDto: {},
};
```

## Fields

| Field                                                                                                                            | Type                                                                                                                             | Required                                                                                                                         | Description                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `subscriberId`                                                                                                                   | *string*                                                                                                                         | :heavy_check_mark:                                                                                                               | N/A                                                                                                                              |
| `idempotencyKey`                                                                                                                 | *string*                                                                                                                         | :heavy_minus_sign:                                                                                                               | A header for idempotency purposes                                                                                                |
| `updateSubscriberGlobalPreferencesRequestDto`                                                                                    | [components.UpdateSubscriberGlobalPreferencesRequestDto](../../models/components/updatesubscriberglobalpreferencesrequestdto.md) | :heavy_check_mark:                                                                                                               | N/A                                                                                                                              |