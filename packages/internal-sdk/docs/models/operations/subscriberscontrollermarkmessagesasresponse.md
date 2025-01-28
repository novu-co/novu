# SubscribersControllerMarkMessagesAsResponse

## Example Usage

```typescript
import { SubscribersControllerMarkMessagesAsResponse } from "@novu/api/models/operations";

let value: SubscribersControllerMarkMessagesAsResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: [
    {
      templateId: "<id>",
      environmentId: "<id>",
      messageTemplateId: "<id>",
      organizationId: "<id>",
      notificationId: "<id>",
      subscriberId: "<id>",
      subscriber: {
        subscriberId: "<id>",
        channels: [
          {
            providerId: "msteams",
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
        createdAt: "1727112408521",
        updatedAt: "1737987469163",
      },
      createdAt: "1721221561089",
      content: {
        type: "button",
        content: "<value>",
      },
      transactionId: "<id>",
      channel: "in_app",
      read: false,
      seen: false,
      cta: {
        data: {},
      },
      status: "error",
    },
  ],
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `headers`                                                                        | Record<string, *string*[]>                                                       | :heavy_check_mark:                                                               | N/A                                                                              |
| `result`                                                                         | [components.MessageResponseDto](../../models/components/messageresponsedto.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |