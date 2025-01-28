# TopicsControllerCreateTopicRequest

## Example Usage

```typescript
import { TopicsControllerCreateTopicRequest } from "@novu/api/models/operations";

let value: TopicsControllerCreateTopicRequest = {
  createTopicRequestDto: {
    key: "<key>",
    name: "<value>",
  },
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `idempotencyKey`                                                                     | *string*                                                                             | :heavy_minus_sign:                                                                   | A header for idempotency purposes                                                    |
| `createTopicRequestDto`                                                              | [components.CreateTopicRequestDto](../../models/components/createtopicrequestdto.md) | :heavy_check_mark:                                                                   | N/A                                                                                  |