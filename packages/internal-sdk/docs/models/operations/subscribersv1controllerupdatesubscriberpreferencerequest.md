# SubscribersV1ControllerUpdateSubscriberPreferenceRequest

## Example Usage

```typescript
import { SubscribersV1ControllerUpdateSubscriberPreferenceRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerUpdateSubscriberPreferenceRequest = {
  subscriberId: "<id>",
  workflowId: "<id>",
  updateSubscriberPreferenceRequestDto: {},
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `subscriberId`                                                                                                     | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `workflowId`                                                                                                       | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `idempotencyKey`                                                                                                   | *string*                                                                                                           | :heavy_minus_sign:                                                                                                 | A header for idempotency purposes                                                                                  |
| `updateSubscriberPreferenceRequestDto`                                                                             | [components.UpdateSubscriberPreferenceRequestDto](../../models/components/updatesubscriberpreferencerequestdto.md) | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |