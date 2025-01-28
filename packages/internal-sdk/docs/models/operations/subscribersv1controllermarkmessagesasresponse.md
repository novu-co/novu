# SubscribersV1ControllerMarkMessagesAsResponse

## Example Usage

```typescript
import { SubscribersV1ControllerMarkMessagesAsResponse } from "@novu/api/models/operations";

let value: SubscribersV1ControllerMarkMessagesAsResponse = {
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
            providerId: "ryver",
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
        createdAt: "1711531748232",
        updatedAt: "1737977619902",
      },
      createdAt: "1727216492878",
      content: {
        type: "button",
        content: "<value>",
      },
      transactionId: "<id>",
      channel: "email",
      read: false,
      seen: false,
      cta: {
        data: {},
      },
      status: "warning",
    },
  ],
};
```

## Fields

| Field                                                                            | Type                                                                             | Required                                                                         | Description                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `headers`                                                                        | Record<string, *string*[]>                                                       | :heavy_check_mark:                                                               | N/A                                                                              |
| `result`                                                                         | [components.MessageResponseDto](../../models/components/messageresponsedto.md)[] | :heavy_check_mark:                                                               | N/A                                                                              |