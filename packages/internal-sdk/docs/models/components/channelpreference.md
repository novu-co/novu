# ChannelPreference

## Example Usage

```typescript
import { ChannelPreference } from "@novu/api/models/components";

let value: ChannelPreference = {
  type: "push",
  enabled: false,
};
```

## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `type`                                                                   | [components.ChannelTypeEnum](../../models/components/channeltypeenum.md) | :heavy_check_mark:                                                       | Channel type through which the message is sent                           |
| `enabled`                                                                | *boolean*                                                                | :heavy_check_mark:                                                       | If channel is enabled or not                                             |