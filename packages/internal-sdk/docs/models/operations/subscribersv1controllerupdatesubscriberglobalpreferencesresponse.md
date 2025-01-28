# SubscribersV1ControllerUpdateSubscriberGlobalPreferencesResponse

## Example Usage

```typescript
import { SubscribersV1ControllerUpdateSubscriberGlobalPreferencesResponse } from "@novu/api/models/operations";

let value: SubscribersV1ControllerUpdateSubscriberGlobalPreferencesResponse = {
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