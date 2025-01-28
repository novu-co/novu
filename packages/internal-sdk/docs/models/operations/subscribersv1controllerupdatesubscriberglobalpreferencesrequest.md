# SubscribersV1ControllerUpdateSubscriberGlobalPreferencesRequest

## Example Usage

```typescript
import { SubscribersV1ControllerUpdateSubscriberGlobalPreferencesRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerUpdateSubscriberGlobalPreferencesRequest = {
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