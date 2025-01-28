# SubscriberChannelDto

## Example Usage

```typescript
import { SubscriberChannelDto } from "@novu/api/models/components";

let value: SubscriberChannelDto = {
  providerId: "rocket-chat",
  credentials: {},
};
```

## Fields

| Field                                                                                | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `providerId`                                                                         | [components.ProviderId](../../models/components/providerid.md)                       | :heavy_check_mark:                                                                   | The ID of the chat or push provider.                                                 |
| `integrationIdentifier`                                                              | *string*                                                                             | :heavy_minus_sign:                                                                   | An optional identifier for the integration.                                          |
| `credentials`                                                                        | [components.ChannelCredentialsDto](../../models/components/channelcredentialsdto.md) | :heavy_check_mark:                                                                   | Credentials for the channel.                                                         |