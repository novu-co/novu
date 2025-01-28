# Errors

## Example Usage

```typescript
import { Errors } from "@novu/api/models/errors";

let value: Errors = {
  messages: [
    "Field is required",
    "Invalid format",
  ],
  value: "xx xx xx ",
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `messages`         | *string*[]         | :heavy_check_mark: | N/A                |
| `value`            | *errors.Value*     | :heavy_check_mark: | N/A                |