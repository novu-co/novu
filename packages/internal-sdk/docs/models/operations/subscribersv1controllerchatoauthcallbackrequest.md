# SubscribersV1ControllerChatOauthCallbackRequest

## Example Usage

```typescript
import { SubscribersV1ControllerChatOauthCallbackRequest } from "@novu/api/models/operations";

let value: SubscribersV1ControllerChatOauthCallbackRequest = {
  subscriberId: "<id>",
  providerId: "<id>",
  hmacHash: "<value>",
  environmentId: "<id>",
  code: "<value>",
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `subscriberId`                                               | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `providerId`                                                 | *string*                                                     | :heavy_check_mark:                                           | N/A                                                          |
| `hmacHash`                                                   | *string*                                                     | :heavy_check_mark:                                           | HMAC hash for the request                                    |
| `environmentId`                                              | *string*                                                     | :heavy_check_mark:                                           | The ID of the environment, must be a valid MongoDB ID        |
| `integrationIdentifier`                                      | *string*                                                     | :heavy_minus_sign:                                           | Optional integration identifier                              |
| `code`                                                       | *string*                                                     | :heavy_check_mark:                                           | Optional authorization code returned from the OAuth provider |
| `idempotencyKey`                                             | *string*                                                     | :heavy_minus_sign:                                           | A header for idempotency purposes                            |