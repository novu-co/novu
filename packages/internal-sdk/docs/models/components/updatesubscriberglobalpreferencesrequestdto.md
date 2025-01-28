# UpdateSubscriberGlobalPreferencesRequestDto

## Example Usage

```typescript
import { UpdateSubscriberGlobalPreferencesRequestDto } from "@novu/api/models/components";

let value: UpdateSubscriberGlobalPreferencesRequestDto = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `enabled`                                                                      | *boolean*                                                                      | :heavy_minus_sign:                                                             | Enable or disable the subscriber global preferences.                           |
| `preferences`                                                                  | [components.ChannelPreference](../../models/components/channelpreference.md)[] | :heavy_minus_sign:                                                             | The subscriber global preferences for every ChannelTypeEnum.                   |