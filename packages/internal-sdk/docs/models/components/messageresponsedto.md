# MessageResponseDto

## Example Usage

```typescript
import { MessageResponseDto } from "@novu/api/models/components";

let value: MessageResponseDto = {
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
    createdAt: "1706885400715",
    updatedAt: "1737996687113",
  },
  createdAt: "1729536967016",
  content: {
    type: "text",
    content: "<value>",
  },
  transactionId: "<id>",
  channel: "in_app",
  read: false,
  seen: false,
  cta: {
    data: {},
  },
  status: "sent",
};
```

## Fields

| Field                                                                                            | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `id`                                                                                             | *string*                                                                                         | :heavy_minus_sign:                                                                               | Unique identifier for the message                                                                |
| `templateId`                                                                                     | *string*                                                                                         | :heavy_check_mark:                                                                               | Template ID associated with the message                                                          |
| `environmentId`                                                                                  | *string*                                                                                         | :heavy_check_mark:                                                                               | Environment ID where the message is sent                                                         |
| `messageTemplateId`                                                                              | *string*                                                                                         | :heavy_check_mark:                                                                               | Message template ID                                                                              |
| `organizationId`                                                                                 | *string*                                                                                         | :heavy_check_mark:                                                                               | Organization ID associated with the message                                                      |
| `notificationId`                                                                                 | *string*                                                                                         | :heavy_check_mark:                                                                               | Notification ID associated with the message                                                      |
| `subscriberId`                                                                                   | *string*                                                                                         | :heavy_check_mark:                                                                               | Subscriber ID associated with the message                                                        |
| `subscriber`                                                                                     | [components.SubscriberResponseDto](../../models/components/subscriberresponsedto.md)             | :heavy_minus_sign:                                                                               | Subscriber details, if available                                                                 |
| `template`                                                                                       | [components.WorkflowResponse](../../models/components/workflowresponse.md)                       | :heavy_minus_sign:                                                                               | Workflow template associated with the message                                                    |
| `templateIdentifier`                                                                             | *string*                                                                                         | :heavy_minus_sign:                                                                               | Identifier for the message template                                                              |
| `createdAt`                                                                                      | *string*                                                                                         | :heavy_check_mark:                                                                               | Creation date of the message                                                                     |
| `lastSeenDate`                                                                                   | *string*                                                                                         | :heavy_minus_sign:                                                                               | Last seen date of the message, if available                                                      |
| `lastReadDate`                                                                                   | *string*                                                                                         | :heavy_minus_sign:                                                                               | Last read date of the message, if available                                                      |
| `content`                                                                                        | *components.Content*                                                                             | :heavy_check_mark:                                                                               | Content of the message, can be an email block or a string                                        |
| `transactionId`                                                                                  | *string*                                                                                         | :heavy_check_mark:                                                                               | Transaction ID associated with the message                                                       |
| `subject`                                                                                        | *string*                                                                                         | :heavy_minus_sign:                                                                               | Subject of the message, if applicable                                                            |
| `channel`                                                                                        | [components.ChannelTypeEnum](../../models/components/channeltypeenum.md)                         | :heavy_check_mark:                                                                               | Channel type through which the message is sent                                                   |
| `read`                                                                                           | *boolean*                                                                                        | :heavy_check_mark:                                                                               | Indicates if the message has been read                                                           |
| `seen`                                                                                           | *boolean*                                                                                        | :heavy_check_mark:                                                                               | Indicates if the message has been seen                                                           |
| `email`                                                                                          | *string*                                                                                         | :heavy_minus_sign:                                                                               | Email address associated with the message, if applicable                                         |
| `phone`                                                                                          | *string*                                                                                         | :heavy_minus_sign:                                                                               | Phone number associated with the message, if applicable                                          |
| `directWebhookUrl`                                                                               | *string*                                                                                         | :heavy_minus_sign:                                                                               | Direct webhook URL for the message, if applicable                                                |
| `providerId`                                                                                     | *string*                                                                                         | :heavy_minus_sign:                                                                               | Provider ID associated with the message, if applicable                                           |
| `deviceTokens`                                                                                   | *string*[]                                                                                       | :heavy_minus_sign:                                                                               | Device tokens associated with the message, if applicable                                         |
| `title`                                                                                          | *string*                                                                                         | :heavy_minus_sign:                                                                               | Title of the message, if applicable                                                              |
| `cta`                                                                                            | [components.MessageCTA](../../models/components/messagecta.md)                                   | :heavy_check_mark:                                                                               | Call to action associated with the message                                                       |
| `feedId`                                                                                         | *string*                                                                                         | :heavy_minus_sign:                                                                               | Feed ID associated with the message, if applicable                                               |
| `status`                                                                                         | [components.MessageStatusEnum](../../models/components/messagestatusenum.md)                     | :heavy_check_mark:                                                                               | Status of the message                                                                            |
| `errorId`                                                                                        | *string*                                                                                         | :heavy_minus_sign:                                                                               | Error ID if the message has an error                                                             |
| `errorText`                                                                                      | *string*                                                                                         | :heavy_minus_sign:                                                                               | Error text if the message has an error                                                           |
| `payload`                                                                                        | [components.MessageResponseDtoPayload](../../models/components/messageresponsedtopayload.md)     | :heavy_minus_sign:                                                                               | The payload that was used to send the notification trigger                                       |
| `overrides`                                                                                      | [components.MessageResponseDtoOverrides](../../models/components/messageresponsedtooverrides.md) | :heavy_minus_sign:                                                                               | Provider specific overrides used when triggering the notification                                |