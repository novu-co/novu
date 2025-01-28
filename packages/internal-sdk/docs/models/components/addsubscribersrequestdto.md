# AddSubscribersRequestDto

## Example Usage

```typescript
import { AddSubscribersRequestDto } from "@novu/api/models/components";

let value: AddSubscribersRequestDto = {
  subscribers: [
    "<value>",
  ],
};
```

## Fields

| Field                                                               | Type                                                                | Required                                                            | Description                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `subscribers`                                                       | *string*[]                                                          | :heavy_check_mark:                                                  | List of subscriber identifiers that will be associated to the topic |