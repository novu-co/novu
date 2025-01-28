# UpdateSubscriberPreferenceGlobalResponseDto

## Example Usage

```typescript
import { UpdateSubscriberPreferenceGlobalResponseDto } from "@novu/api/models/components";

let value: UpdateSubscriberPreferenceGlobalResponseDto = {
  preference: {
    enabled: false,
    channels: {},
  },
};
```

## Fields

| Field                                                            | Type                                                             | Required                                                         | Description                                                      |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `preference`                                                     | [components.Preference](../../models/components/preference.md)   | :heavy_check_mark:                                               | The preferences of the subscriber regarding the related workflow |