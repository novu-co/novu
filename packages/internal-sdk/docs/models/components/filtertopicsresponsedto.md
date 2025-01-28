# FilterTopicsResponseDto

## Example Usage

```typescript
import { FilterTopicsResponseDto } from "@novu/api/models/components";

let value: FilterTopicsResponseDto = {
  data: [],
  page: 1,
  pageSize: 10,
  totalCount: 10,
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  | Example                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `data`                                                       | [components.TopicDto](../../models/components/topicdto.md)[] | :heavy_check_mark:                                           | The list of topics                                           | []                                                           |
| `page`                                                       | *number*                                                     | :heavy_check_mark:                                           | The current page number                                      | 1                                                            |
| `pageSize`                                                   | *number*                                                     | :heavy_check_mark:                                           | The number of items per page                                 | 10                                                           |
| `totalCount`                                                 | *number*                                                     | :heavy_check_mark:                                           | The total number of items                                    | 10                                                           |