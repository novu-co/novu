# ActivityNotificationTemplateResponseDto

## Example Usage

```typescript
import { ActivityNotificationTemplateResponseDto } from "@novu/api/models/components";

let value: ActivityNotificationTemplateResponseDto = {
  name: "<value>",
  triggers: [
    {
      type: "event",
      identifier: "<value>",
      variables: [
        {
          name: "<value>",
        },
      ],
    },
  ],
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`                                                                                     | *string*                                                                                 | :heavy_minus_sign:                                                                       | Unique identifier of the template                                                        |
| `name`                                                                                   | *string*                                                                                 | :heavy_check_mark:                                                                       | Name of the template                                                                     |
| `triggers`                                                                               | [components.NotificationTriggerDto](../../models/components/notificationtriggerdto.md)[] | :heavy_check_mark:                                                                       | Triggers of the template                                                                 |