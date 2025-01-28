# NotificationsControllerGetNotificationResponse

## Example Usage

```typescript
import { NotificationsControllerGetNotificationResponse } from "@novu/api/models/operations";

let value: NotificationsControllerGetNotificationResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    environmentId: "<id>",
    organizationId: "<id>",
    subscriberId: "<id>",
    transactionId: "<id>",
  },
};
```

## Fields

| Field                                                                                                    | Type                                                                                                     | Required                                                                                                 | Description                                                                                              |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `headers`                                                                                                | Record<string, *string*[]>                                                                               | :heavy_check_mark:                                                                                       | N/A                                                                                                      |
| `result`                                                                                                 | [components.ActivityNotificationResponseDto](../../models/components/activitynotificationresponsedto.md) | :heavy_check_mark:                                                                                       | N/A                                                                                                      |