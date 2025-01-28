# EventsControllerTriggerBulkRequest

## Example Usage

```typescript
import { EventsControllerTriggerBulkRequest } from "@novu/api/models/operations";

let value: EventsControllerTriggerBulkRequest = {
  bulkTriggerEventDto: {
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
          subscriberId: "<id>",
        },
      },
    ],
  },
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `idempotencyKey`                                                                 | *string*                                                                         | :heavy_minus_sign:                                                               | A header for idempotency purposes                                                |
| `bulkTriggerEventDto`                                                            | [components.BulkTriggerEventDto](../../models/components/bulktriggereventdto.md) | :heavy_check_mark:                                                               | N/A                                                                              |