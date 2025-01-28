# TopicPayloadDto

## Example Usage

```typescript
import { TopicPayloadDto } from "@novu/api/models/components";

let value: TopicPayloadDto = {
  topicKey: "<value>",
  type: "Subscriber",
};
```

## Fields

| Field                                                                                        | Type                                                                                         | Required                                                                                     | Description                                                                                  |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `topicKey`                                                                                   | *string*                                                                                     | :heavy_check_mark:                                                                           | N/A                                                                                          |
| `type`                                                                                       | [components.TriggerRecipientsTypeEnum](../../models/components/triggerrecipientstypeenum.md) | :heavy_check_mark:                                                                           | N/A                                                                                          |