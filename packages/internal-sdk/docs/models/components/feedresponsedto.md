# FeedResponseDto

## Example Usage

```typescript
import { FeedResponseDto } from "@novu/api/models/components";

let value: FeedResponseDto = {
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
        type: "system_custom",
      },
      transactionId: "transaction_123456",
      templateIdentifier: "template_abcdef",
      providerId: "provider_xyz",
      content: "This is a test notification content.",
      subject: "Test Notification Subject",
      channel: "push",
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
};
```

## Fields

| Field                                                                                      | Type                                                                                       | Required                                                                                   | Description                                                                                | Example                                                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `totalCount`                                                                               | *number*                                                                                   | :heavy_minus_sign:                                                                         | Total number of notifications available.                                                   | 5                                                                                          |
| `hasMore`                                                                                  | *boolean*                                                                                  | :heavy_check_mark:                                                                         | Indicates if there are more notifications to load.                                         | true                                                                                       |
| `data`                                                                                     | [components.NotificationFeedItemDto](../../models/components/notificationfeeditemdto.md)[] | :heavy_check_mark:                                                                         | Array of notifications returned in the response.                                           |                                                                                            |
| `pageSize`                                                                                 | *number*                                                                                   | :heavy_check_mark:                                                                         | The number of notifications returned in this response.                                     | 2                                                                                          |
| `page`                                                                                     | *number*                                                                                   | :heavy_check_mark:                                                                         | The current page number of the notifications.                                              | 1                                                                                          |