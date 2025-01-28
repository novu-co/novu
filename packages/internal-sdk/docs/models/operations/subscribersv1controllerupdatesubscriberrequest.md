# SubscribersV1ControllerUpdateSubscriberRequest

## Example Usage

```typescript
import { SubscribersV1ControllerUpdateSubscriberRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerUpdateSubscriberRequest = {
  subscriberId: "<id>",
  updateSubscriberRequestDto: {
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    avatar: "https://example.com/avatar.jpg",
    locale: "en-US",
    data: {
      "preferences": {
        "notifications": true,
        "theme": "dark",
      },
      "tags": [
        "premium",
        "newsletter",
      ],
    },
  },
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `subscriberId`                                                                                 | *string*                                                                                       | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `idempotencyKey`                                                                               | *string*                                                                                       | :heavy_minus_sign:                                                                             | A header for idempotency purposes                                                              |
| `updateSubscriberRequestDto`                                                                   | [components.UpdateSubscriberRequestDto](../../models/components/updatesubscriberrequestdto.md) | :heavy_check_mark:                                                                             | N/A                                                                                            |