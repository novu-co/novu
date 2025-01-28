# SubscribersControllerListSubscribersResponseBody

## Example Usage

```typescript
import { SubscribersControllerListSubscribersResponseBody } from "@novu/api/models/operations";

let value: SubscribersControllerListSubscribersResponseBody = {
  page: 7781.57,
  hasMore: false,
  pageSize: 8700.13,
  data: [
    {
      subscriberId: "<id>",
      channels: [
        {
          providerId: "pusher-beams",
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
      createdAt: "1731718248608",
      updatedAt: "1738005456281",
    },
  ],
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `page`                                                                                 | *number*                                                                               | :heavy_check_mark:                                                                     | The current page of the paginated response                                             |
| `hasMore`                                                                              | *boolean*                                                                              | :heavy_check_mark:                                                                     | Does the list have more items to fetch                                                 |
| `pageSize`                                                                             | *number*                                                                               | :heavy_check_mark:                                                                     | Number of items on each page                                                           |
| `data`                                                                                 | [components.SubscriberResponseDto](../../models/components/subscriberresponsedto.md)[] | :heavy_check_mark:                                                                     | N/A                                                                                    |