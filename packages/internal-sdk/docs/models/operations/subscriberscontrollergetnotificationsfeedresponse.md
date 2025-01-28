# SubscribersControllerGetNotificationsFeedResponse

## Example Usage

```typescript
import { SubscribersControllerGetNotificationsFeedResponse } from "@novu/api/models/operations";

let value: SubscribersControllerGetNotificationsFeedResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    totalCount: 5,
    hasMore: true,
    data: [
      {
        id: "615c1f2f9b0c5b001f8e4e3b",
        templateId: "template_12345",
        environmentId: "env_67890",
        messageTemplateId: "message_template_54321",
        organizationId: "org_98765",
        notificationId: "notification_123456",
        subscriberId: "subscriber_112233",
        feedId: "feed_445566",
        jobId: "job_778899",
        createdAt: new Date("2024-12-10T10:10:59.639Z"),
        updatedAt: new Date("2024-12-10T10:10:59.639Z"),
        actor: {
          data: null,
          type: "system_icon",
        },
        transactionId: "transaction_123456",
        templateIdentifier: "template_abcdef",
        providerId: "provider_xyz",
        content: "This is a test notification content.",
        subject: "Test Notification Subject",
        channel: "sms",
        read: false,
        seen: true,
        deleted: false,
        deviceTokens: [
          "token1",
          "token2",
        ],
        cta: {
          data: {},
        },
        status: "sent",
        payload: {
          "key": "value",
        },
        overrides: {
          "overrideKey": "overrideValue",
        },
      },
    ],
    pageSize: 2,
    page: 1,
  },
};
```

## Fields

| Field                                                                    | Type                                                                     | Required                                                                 | Description                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `headers`                                                                | Record<string, *string*[]>                                               | :heavy_check_mark:                                                       | N/A                                                                      |
| `result`                                                                 | [components.FeedResponseDto](../../models/components/feedresponsedto.md) | :heavy_check_mark:                                                       | N/A                                                                      |