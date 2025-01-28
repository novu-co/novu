# EventsControllerTriggerRequest

## Example Usage

```typescript
import { EventsControllerTriggerRequest } from "@novu/api/models/operations";

let value: EventsControllerTriggerRequest = {
  triggerEventRequestDto: {
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
      subscriberId: "<id>",
    },
  },
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `idempotencyKey`                                                                       | *string*                                                                               | :heavy_minus_sign:                                                                     | A header for idempotency purposes                                                      |
| `triggerEventRequestDto`                                                               | [components.TriggerEventRequestDto](../../models/components/triggereventrequestdto.md) | :heavy_check_mark:                                                                     | N/A                                                                                    |