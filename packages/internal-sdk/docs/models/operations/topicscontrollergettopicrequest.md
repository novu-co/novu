# TopicsControllerGetTopicRequest

## Example Usage

```typescript
import { TopicsControllerGetTopicRequest } from "@novu/api/models/operations";

let value: TopicsControllerGetTopicRequest = {
  topicKey: "<value>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `topicKey`                        | *string*                          | :heavy_check_mark:                | The topic key                     |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |