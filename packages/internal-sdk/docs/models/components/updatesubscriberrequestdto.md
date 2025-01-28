# UpdateSubscriberRequestDto

## Example Usage

```typescript
import { UpdateSubscriberRequestDto } from "@novu/api/models/components";

let value: UpdateSubscriberRequestDto = {
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890",
  avatar: "https://example.com/avatar.jpg",
  locale: "en-US",
  data: {
    "preferences": {
      "notifications": true,
      "theme": "dark",
    },
    "tags": [
      "premium",
      "newsletter",
    ],
  },
};
```

## Fields

| Field                                                                                              | Type                                                                                               | Required                                                                                           | Description                                                                                        | Example                                                                                            |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `email`                                                                                            | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The email address of the subscriber.                                                               | john.doe@example.com                                                                               |
| `firstName`                                                                                        | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The first name of the subscriber.                                                                  | John                                                                                               |
| `lastName`                                                                                         | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The last name of the subscriber.                                                                   | Doe                                                                                                |
| `phone`                                                                                            | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The phone number of the subscriber.                                                                | +1234567890                                                                                        |
| `avatar`                                                                                           | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The avatar URL of the subscriber.                                                                  | https://example.com/avatar.jpg                                                                     |
| `locale`                                                                                           | *string*                                                                                           | :heavy_minus_sign:                                                                                 | The locale of the subscriber, for example "en-US".                                                 | en-US                                                                                              |
| `data`                                                                                             | Record<string, *any*>                                                                              | :heavy_minus_sign:                                                                                 | Custom data associated with the subscriber. Can contain any additional properties.                 | {<br/>"preferences": {<br/>"notifications": true,<br/>"theme": "dark"<br/>},<br/>"tags": [<br/>"premium",<br/>"newsletter"<br/>]<br/>} |
| `channels`                                                                                         | [components.SubscriberChannelDto](../../models/components/subscriberchanneldto.md)[]               | :heavy_minus_sign:                                                                                 | An array of communication channels for the subscriber.                                             |                                                                                                    |