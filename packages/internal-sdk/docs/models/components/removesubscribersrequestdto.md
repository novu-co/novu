# RemoveSubscribersRequestDto

## Example Usage

```typescript
import { RemoveSubscribersRequestDto } from "@novu/api/models/components";

let value: RemoveSubscribersRequestDto = {
  subscribers: [
    "<value>",
  ],
};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `subscribers`                                                    | *string*[]                                                       | :heavy_check_mark:                                               | List of subscriber identifiers that will be removed to the topic |