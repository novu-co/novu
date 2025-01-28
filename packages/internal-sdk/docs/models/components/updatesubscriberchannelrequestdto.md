# UpdateSubscriberChannelRequestDto

## Example Usage

```typescript
import { UpdateSubscriberChannelRequestDto } from "@novu/api/models/components";

let value: UpdateSubscriberChannelRequestDto = {
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
};
```

## Fields

| Field                                                                                                                            | Type                                                                                                                             | Required                                                                                                                         | Description                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `providerId`                                                                                                                     | [components.UpdateSubscriberChannelRequestDtoProviderId](../../models/components/updatesubscriberchannelrequestdtoproviderid.md) | :heavy_check_mark:                                                                                                               | The provider identifier for the credentials                                                                                      |
| `integrationIdentifier`                                                                                                          | *string*                                                                                                                         | :heavy_minus_sign:                                                                                                               | The integration identifier                                                                                                       |
| `credentials`                                                                                                                    | [components.ChannelCredentials](../../models/components/channelcredentials.md)                                                   | :heavy_check_mark:                                                                                                               | Credentials payload for the specified provider                                                                                   |