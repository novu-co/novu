# TopicsControllerRenameTopicResponse

## Example Usage

```typescript
import { TopicsControllerRenameTopicResponse } from "@novu/api/models/operations";

let value: TopicsControllerRenameTopicResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    organizationId: "<id>",
    environmentId: "<id>",
    key: "<key>",
    name: "<value>",
    subscribers: [
      "<value>",
    ],
  },
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `headers`                                                                              | Record<string, *string*[]>                                                             | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `result`                                                                               | [components.RenameTopicResponseDto](../../models/components/renametopicresponsedto.md) | :heavy_check_mark:                                                                     | N/A                                                                                    |