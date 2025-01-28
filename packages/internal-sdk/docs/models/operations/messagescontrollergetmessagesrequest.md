# MessagesControllerGetMessagesRequest

## Example Usage

```typescript
import { MessagesControllerGetMessagesRequest } from "@novu/api/models/operations";

let value: MessagesControllerGetMessagesRequest = {};
```

## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `channel`                                                                | [components.ChannelTypeEnum](../../models/components/channeltypeenum.md) | :heavy_minus_sign:                                                       | Channel type through which the message is sent                           |
| `subscriberId`                                                           | *string*                                                                 | :heavy_minus_sign:                                                       | N/A                                                                      |
| `transactionId`                                                          | *string*[]                                                               | :heavy_minus_sign:                                                       | N/A                                                                      |
| `page`                                                                   | *number*                                                                 | :heavy_minus_sign:                                                       | N/A                                                                      |
| `limit`                                                                  | *number*                                                                 | :heavy_minus_sign:                                                       | N/A                                                                      |
| `idempotencyKey`                                                         | *string*                                                                 | :heavy_minus_sign:                                                       | A header for idempotency purposes                                        |