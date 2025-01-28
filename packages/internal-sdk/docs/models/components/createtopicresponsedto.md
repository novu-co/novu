# CreateTopicResponseDto

## Example Usage

```typescript
import { CreateTopicResponseDto } from "@novu/api/models/components";

let value: CreateTopicResponseDto = {
  key: "<key>",
};
```

## Fields

| Field                                                                                                     | Type                                                                                                      | Required                                                                                                  | Description                                                                                               |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                                                                                                      | *string*                                                                                                  | :heavy_minus_sign:                                                                                        | The unique identifier for the Topic created.                                                              |
| `key`                                                                                                     | *string*                                                                                                  | :heavy_check_mark:                                                                                        | User defined custom key and provided by the user that will be an unique identifier for the Topic created. |