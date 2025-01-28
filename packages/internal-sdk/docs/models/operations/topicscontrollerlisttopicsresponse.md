# TopicsControllerListTopicsResponse

## Example Usage

```typescript
import { TopicsControllerListTopicsResponse } from "@novu/api/models/operations";

let value: TopicsControllerListTopicsResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 10,
  },
};
```

## Fields

| Field                                                                                    | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `headers`                                                                                | Record<string, *string*[]>                                                               | :heavy_check_mark:                                                                       | N/A                                                                                      |
| `result`                                                                                 | [components.FilterTopicsResponseDto](../../models/components/filtertopicsresponsedto.md) | :heavy_check_mark:                                                                       | N/A                                                                                      |