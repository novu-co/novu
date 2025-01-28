# SubscribersControllerListSubscriberPreferencesResponse

## Example Usage

```typescript
import { SubscribersControllerListSubscriberPreferencesResponse } from "@novu/api/models/operations";

let value: SubscribersControllerListSubscriberPreferencesResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: [
    {
      template: {
        id: "<id>",
        name: "<value>",
        critical: false,
        triggers: [
          {
            type: "event",
            identifier: "<value>",
            variables: [
              {
                name: "<value>",
              },
            ],
          },
        ],
      },
      preference: {
        enabled: false,
        channels: {},
      },
    },
  ],
};
```

## Fields

| Field                                                                                                                  | Type                                                                                                                   | Required                                                                                                               | Description                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `headers`                                                                                                              | Record<string, *string*[]>                                                                                             | :heavy_check_mark:                                                                                                     | N/A                                                                                                                    |
| `result`                                                                                                               | [components.UpdateSubscriberPreferenceResponseDto](../../models/components/updatesubscriberpreferenceresponsedto.md)[] | :heavy_check_mark:                                                                                                     | N/A                                                                                                                    |