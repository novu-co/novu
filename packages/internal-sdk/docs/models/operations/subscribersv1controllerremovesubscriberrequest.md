# SubscribersV1ControllerRemoveSubscriberRequest

## Example Usage

```typescript
import { SubscribersV1ControllerRemoveSubscriberRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerRemoveSubscriberRequest = {
  subscriberId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `subscriberId`                    | *string*                          | :heavy_check_mark:                | N/A                               |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |