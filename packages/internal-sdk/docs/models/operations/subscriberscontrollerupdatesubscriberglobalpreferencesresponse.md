# SubscribersControllerUpdateSubscriberGlobalPreferencesResponse

## Example Usage

```typescript
import { SubscribersControllerUpdateSubscriberGlobalPreferencesResponse } from "@novu/api/models/operations";

let value: SubscribersControllerUpdateSubscriberGlobalPreferencesResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    preference: {
      enabled: false,
      channels: {},
    },
  },
};
```

## Fields

| Field                                                                                                                            | Type                                                                                                                             | Required                                                                                                                         | Description                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `headers`                                                                                                                        | Record<string, *string*[]>                                                                                                       | :heavy_check_mark:                                                                                                               | N/A                                                                                                                              |
| `result`                                                                                                                         | [components.UpdateSubscriberPreferenceGlobalResponseDto](../../models/components/updatesubscriberpreferenceglobalresponsedto.md) | :heavy_check_mark:                                                                                                               | N/A                                                                                                                              |