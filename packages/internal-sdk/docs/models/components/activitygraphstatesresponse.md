# ActivityGraphStatesResponse

## Example Usage

```typescript
import { ActivityGraphStatesResponse } from "@novu/api/models/components";

let value: ActivityGraphStatesResponse = {
  id: "<id>",
  count: 8919.24,
  templates: [
    "<value>",
  ],
  channels: [
    "push",
  ],
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `count`                                                      | *number*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `templates`                                                  | *string*[]                                                   | :heavy_check_mark:                                           | N/A                                                          |
| `channels`                                                   | [components.Channels](../../models/components/channels.md)[] | :heavy_check_mark:                                           | N/A                                                          |