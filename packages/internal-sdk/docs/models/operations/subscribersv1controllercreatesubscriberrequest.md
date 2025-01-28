# SubscribersV1ControllerCreateSubscriberRequest

## Example Usage

```typescript
import { SubscribersV1ControllerCreateSubscriberRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerCreateSubscriberRequest = {
  createSubscriberRequestDto: {
    subscriberId: "<id>",
  },
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `idempotencyKey`                                                                               | *string*                                                                                       | :heavy_minus_sign:                                                                             | A header for idempotency purposes                                                              |
| `createSubscriberRequestDto`                                                                   | [components.CreateSubscriberRequestDto](../../models/components/createsubscriberrequestdto.md) | :heavy_check_mark:                                                                             | N/A                                                                                            |