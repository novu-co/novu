# SubscribersControllerGetSubscriberPreferenceByLevelResponse

## Example Usage

```typescript
import { SubscribersControllerGetSubscriberPreferenceByLevelResponse } from "@novu/api/models/operations";

let value: SubscribersControllerGetSubscriberPreferenceByLevelResponse = {
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