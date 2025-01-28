# MessagesControllerDeleteMessagesByTransactionIdRequest

## Example Usage

```typescript
import { MessagesControllerDeleteMessagesByTransactionIdRequest } from "@novu/api/models/operations";

let value: MessagesControllerDeleteMessagesByTransactionIdRequest = {
  transactionId: "<id>",
};
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `channel`                                                | [operations.Channel](../../models/operations/channel.md) | :heavy_minus_sign:                                       | The channel of the message to be deleted                 |
| `transactionId`                                          | *string*                                                 | :heavy_check_mark:                                       | N/A                                                      |
| `idempotencyKey`                                         | *string*                                                 | :heavy_minus_sign:                                       | A header for idempotency purposes                        |