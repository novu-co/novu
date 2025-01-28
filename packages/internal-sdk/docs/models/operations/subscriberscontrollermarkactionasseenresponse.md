# SubscribersControllerMarkActionAsSeenResponse

## Example Usage

```typescript
import { SubscribersControllerMarkActionAsSeenResponse } from "@novu/api/models/operations";

let value: SubscribersControllerMarkActionAsSeenResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
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
          providerId: "one-signal",
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
      createdAt: "1709578170772",
      updatedAt: "1738037982638",
    },
    createdAt: "1709546544332",
    content: "<value>",
    transactionId: "<id>",
    channel: "sms",
    read: false,
    seen: false,
    cta: {
      data: {},
    },
    status: "warning",
  },
};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `headers`                                                                      | Record<string, *string*[]>                                                     | :heavy_check_mark:                                                             | N/A                                                                            |
| `result`                                                                       | [components.MessageResponseDto](../../models/components/messageresponsedto.md) | :heavy_check_mark:                                                             | N/A                                                                            |