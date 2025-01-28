# SubscribersV1ControllerListSubscriberPreferencesRequest

## Example Usage

```typescript
import { SubscribersV1ControllerListSubscriberPreferencesRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerListSubscriberPreferencesRequest = {
  subscriberId: "<id>",
};
```

## Fields

| Field                                                                                                                     | Type                                                                                                                      | Required                                                                                                                  | Description                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `subscriberId`                                                                                                            | *string*                                                                                                                  | :heavy_check_mark:                                                                                                        | N/A                                                                                                                       |
| `includeInactiveChannels`                                                                                                 | *boolean*                                                                                                                 | :heavy_minus_sign:                                                                                                        | A flag which specifies if the inactive workflow channels should be included in the retrieved preferences. Default is true |
| `idempotencyKey`                                                                                                          | *string*                                                                                                                  | :heavy_minus_sign:                                                                                                        | A header for idempotency purposes                                                                                         |