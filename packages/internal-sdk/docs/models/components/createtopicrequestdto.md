# CreateTopicRequestDto

## Example Usage

```typescript
import { CreateTopicRequestDto } from "@novu/api/models/components";

let value: CreateTopicRequestDto = {
  key: "<key>",
  name: "<value>",
};
```

## Fields

| Field                                                                                                     | Type                                                                                                      | Required                                                                                                  | Description                                                                                               |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `key`                                                                                                     | *string*                                                                                                  | :heavy_check_mark:                                                                                        | User defined custom key and provided by the user that will be an unique identifier for the Topic created. |
| `name`                                                                                                    | *string*                                                                                                  | :heavy_check_mark:                                                                                        | User defined custom name and provided by the user that will name the Topic created.                       |