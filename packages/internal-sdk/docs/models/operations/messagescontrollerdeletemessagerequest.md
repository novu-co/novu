# MessagesControllerDeleteMessageRequest

## Example Usage

```typescript
import { MessagesControllerDeleteMessageRequest } from "@novu/api/models/operations";

let value: MessagesControllerDeleteMessageRequest = {
  messageId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `messageId`                       | *string*                          | :heavy_check_mark:                | N/A                               |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |