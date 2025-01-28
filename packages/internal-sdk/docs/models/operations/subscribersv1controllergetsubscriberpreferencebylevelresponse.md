# SubscribersV1ControllerGetSubscriberPreferenceByLevelResponse

## Example Usage

```typescript
import { SubscribersV1ControllerGetSubscriberPreferenceByLevelResponse } from "@novu/api/models/operations";

let value: SubscribersV1ControllerGetSubscriberPreferenceByLevelResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: [
    {
      preference: {
        enabled: false,
        channels: {},
      },
    },
  ],
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `headers`                                                                                                          | Record<string, *string*[]>                                                                                         | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |
| `result`                                                                                                           | [components.GetSubscriberPreferencesResponseDto](../../models/components/getsubscriberpreferencesresponsedto.md)[] | :heavy_check_mark:                                                                                                 | N/A                                                                                                                |