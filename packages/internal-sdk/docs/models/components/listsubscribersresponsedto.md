# ListSubscribersResponseDto

## Example Usage

```typescript
import { ListSubscribersResponseDto } from "@novu/api/models/components";

let value: ListSubscribersResponseDto = {
  data: [
    {
      subscriberId: "<id>",
      channels: [
        {
          providerId: "pushpad",
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
      createdAt: "1731978093929",
      updatedAt: "1738017253789",
    },
  ],
  next: "<value>",
  previous: "<value>",
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `data`                                                                                 | [components.SubscriberResponseDto](../../models/components/subscriberresponsedto.md)[] | :heavy_check_mark:                                                                     | List of returned Subscribers                                                           |
| `next`                                                                                 | *string*                                                                               | :heavy_check_mark:                                                                     | The cursor for the next page of results, or null if there are no more pages.           |
| `previous`                                                                             | *string*                                                                               | :heavy_check_mark:                                                                     | The cursor for the previous page of results, or null if this is the first page.        |