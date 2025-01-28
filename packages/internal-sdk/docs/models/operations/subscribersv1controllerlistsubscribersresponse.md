# SubscribersV1ControllerListSubscribersResponse

## Example Usage

```typescript
import { SubscribersV1ControllerListSubscribersResponse } from "@novu/api/models/operations";

let value: SubscribersV1ControllerListSubscribersResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    page: 7805.29,
    hasMore: false,
    pageSize: 1182.74,
    data: [
      {
        subscriberId: "<id>",
        channels: [
          {
            providerId: "fcm",
            credentials: {
              webhookUrl: "https://example.com/webhook",
              channel: "general",
              deviceTokens: [
                "token1",
                "token2",
                "token3",
              ],
              alertUid: "12345-abcde",
              title: "Critical Alert",
              imageUrl: "https://example.com/image.png",
              state: "resolved",
              externalUrl: "https://example.com/details",
            },
            integrationId: "<id>",
          },
        ],
        organizationId: "<id>",
        environmentId: "<id>",
        deleted: false,
        createdAt: "1711039272629",
        updatedAt: "1738049701951",
      },
    ],
  },
};
```

## Fields

| Field                                                                                                                                          | Type                                                                                                                                           | Required                                                                                                                                       | Description                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `headers`                                                                                                                                      | Record<string, *string*[]>                                                                                                                     | :heavy_check_mark:                                                                                                                             | N/A                                                                                                                                            |
| `result`                                                                                                                                       | [operations.SubscribersV1ControllerListSubscribersResponseBody](../../models/operations/subscribersv1controllerlistsubscribersresponsebody.md) | :heavy_check_mark:                                                                                                                             | N/A                                                                                                                                            |