# TopicsControllerGetTopicResponse

## Example Usage

```typescript
import { TopicsControllerGetTopicResponse } from "@novu/api/models/operations";

let value: TopicsControllerGetTopicResponse = {
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

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `headers`                                                                        | Record<string, *string*[]>                                                       | :heavy_check_mark:                                                               | N/A                                                                              |
| `result`                                                                         | [components.GetTopicResponseDto](../../models/components/gettopicresponsedto.md) | :heavy_check_mark:                                                               | N/A                                                                              |