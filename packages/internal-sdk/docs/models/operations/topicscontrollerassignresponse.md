# TopicsControllerAssignResponse

## Example Usage

```typescript
import { TopicsControllerAssignResponse } from "@novu/api/models/operations";

let value: TopicsControllerAssignResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    succeeded: [
      "<value>",
    ],
  },
};
```

## Fields

| Field                                                                                          | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `headers`                                                                                      | Record<string, *string*[]>                                                                     | :heavy_check_mark:                                                                             | N/A                                                                                            |
| `result`                                                                                       | [components.AssignSubscriberToTopicDto](../../models/components/assignsubscribertotopicdto.md) | :heavy_check_mark:                                                                             | N/A                                                                                            |