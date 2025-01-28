# MessageCTA

## Example Usage

```typescript
import { MessageCTA } from "@novu/api/models/components";

let value: MessageCTA = {
  data: {},
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `type`                                                                         | [components.ChannelCTATypeEnum](../../models/components/channelctatypeenum.md) | :heavy_minus_sign:                                                             | Type of call to action                                                         |
| `data`                                                                         | [components.MessageCTAData](../../models/components/messagectadata.md)         | :heavy_check_mark:                                                             | Data associated with the call to action                                        |
| `action`                                                                       | [components.MessageAction](../../models/components/messageaction.md)           | :heavy_minus_sign:                                                             | Action associated with the call to action                                      |