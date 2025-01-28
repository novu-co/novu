# TopicsControllerRenameTopicRequest

## Example Usage

```typescript
import { TopicsControllerRenameTopicRequest } from "@novu/api/models/operations";

let value: TopicsControllerRenameTopicRequest = {
  topicKey: "<value>",
  renameTopicRequestDto: {
    name: "<value>",
  },
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `topicKey`                                                                           | *string*                                                                             | :heavy_check_mark:                                                                   | The topic key                                                                        |
| `idempotencyKey`                                                                     | *string*                                                                             | :heavy_minus_sign:                                                                   | A header for idempotency purposes                                                    |
| `renameTopicRequestDto`                                                              | [components.RenameTopicRequestDto](../../models/components/renametopicrequestdto.md) | :heavy_check_mark:                                                                   | N/A                                                                                  |