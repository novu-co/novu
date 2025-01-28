# TopicsControllerGetTopicSubscriberRequest

## Example Usage

```typescript
import { TopicsControllerGetTopicSubscriberRequest } from "@novu/api/models/operations";

let value: TopicsControllerGetTopicSubscriberRequest = {
  topicKey: "<value>",
  externalSubscriberId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `topicKey`                        | *string*                          | :heavy_check_mark:                | The topic key                     |
| `externalSubscriberId`            | *string*                          | :heavy_check_mark:                | The external subscriber id        |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |