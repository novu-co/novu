# TemplateResponse

## Example Usage

```typescript
import { TemplateResponse } from "@novu/api/models/components";

let value: TemplateResponse = {
  id: "<id>",
  name: "<value>",
  critical: false,
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

| Field                                                                                                                   | Type                                                                                                                    | Required                                                                                                                | Description                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `id`                                                                                                                    | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | Unique identifier of the workflow                                                                                       |
| `name`                                                                                                                  | *string*                                                                                                                | :heavy_check_mark:                                                                                                      | Name of the workflow                                                                                                    |
| `critical`                                                                                                              | *boolean*                                                                                                               | :heavy_check_mark:                                                                                                      | Critical templates will always be delivered to the end user and should be hidden from the subscriber preferences screen |
| `triggers`                                                                                                              | [components.NotificationTriggerResponse](../../models/components/notificationtriggerresponse.md)[]                      | :heavy_check_mark:                                                                                                      | Triggers are the events that will trigger the workflow.                                                                 |