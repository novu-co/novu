# EventsControllerTriggerBulkResponse

## Example Usage

```typescript
import { EventsControllerTriggerBulkResponse } from "@novu/api/models/operations";

let value: EventsControllerTriggerBulkResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: [
    {
      acknowledged: false,
      status: "no_workflow_steps_defined",
    },
  ],
};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `headers`                                                                                  | Record<string, *string*[]>                                                                 | :heavy_check_mark:                                                                         | N/A                                                                                        |
| `result`                                                                                   | [components.TriggerEventResponseDto](../../models/components/triggereventresponsedto.md)[] | :heavy_check_mark:                                                                         | N/A                                                                                        |