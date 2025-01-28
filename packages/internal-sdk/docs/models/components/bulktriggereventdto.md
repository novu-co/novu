# BulkTriggerEventDto

## Example Usage

```typescript
import { BulkTriggerEventDto } from "@novu/api/models/components";

let value: BulkTriggerEventDto = {
  events: [
    {
      name: "workflow_identifier",
      payload: {
        "comment_id": "string",
        "post": {
          "text": "string",
        },
      },
      bridgeUrl: "https://example.com/bridge",
      overrides: {
        "fcm": {
          "data": {
            "key": "value",
          },
        },
      },
      to: {
        topicKey: "<value>",
        type: "Subscriber",
      },
    },
  ],
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `events`                                                                                 | [components.TriggerEventRequestDto](../../models/components/triggereventrequestdto.md)[] | :heavy_check_mark:                                                                       | N/A                                                                                      |