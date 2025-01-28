# UpdateSubscriberPreferenceRequestDto

## Example Usage

```typescript
import { UpdateSubscriberPreferenceRequestDto } from "@novu/api/models/components";

let value: UpdateSubscriberPreferenceRequestDto = {};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `channel`                                                                            | [components.ChannelPreference](../../models/components/channelpreference.md)         | :heavy_minus_sign:                                                                   | Optional preferences for each channel type in the assigned workflow.                 |
| `enabled`                                                                            | *boolean*                                                                            | :heavy_minus_sign:                                                                   | Indicates whether the workflow is fully enabled for all channels for the subscriber. |