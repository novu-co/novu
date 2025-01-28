# RenameTopicResponseDto

## Example Usage

```typescript
import { RenameTopicResponseDto } from "@novu/api/models/components";

let value: RenameTopicResponseDto = {
  organizationId: "<id>",
  environmentId: "<id>",
  key: "<key>",
  name: "<value>",
  subscribers: [
    "<value>",
  ],
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `id`               | *string*           | :heavy_minus_sign: | N/A                |
| `organizationId`   | *string*           | :heavy_check_mark: | N/A                |
| `environmentId`    | *string*           | :heavy_check_mark: | N/A                |
| `key`              | *string*           | :heavy_check_mark: | N/A                |
| `name`             | *string*           | :heavy_check_mark: | N/A                |
| `subscribers`      | *string*[]         | :heavy_check_mark: | N/A                |