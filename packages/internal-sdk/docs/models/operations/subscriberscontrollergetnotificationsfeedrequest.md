# SubscribersControllerGetNotificationsFeedRequest

## Example Usage

```typescript
import { SubscribersControllerGetNotificationsFeedRequest } from "@novu/api/models/operations";

let value: SubscribersControllerGetNotificationsFeedRequest = {
  subscriberId: "<id>",
  payload:
    "btoa(JSON.stringify({ foo: 123 })) results in base64 encoded string like eyJmb28iOjEyM30=",
};
```

## Fields

| Field                                                                                     | Type                                                                                      | Required                                                                                  | Description                                                                               | Example                                                                                   |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `subscriberId`                                                                            | *string*                                                                                  | :heavy_check_mark:                                                                        | N/A                                                                                       |                                                                                           |
| `page`                                                                                    | *number*                                                                                  | :heavy_minus_sign:                                                                        | N/A                                                                                       |                                                                                           |
| `limit`                                                                                   | *number*                                                                                  | :heavy_minus_sign:                                                                        | N/A                                                                                       |                                                                                           |
| `read`                                                                                    | *boolean*                                                                                 | :heavy_minus_sign:                                                                        | N/A                                                                                       |                                                                                           |
| `seen`                                                                                    | *boolean*                                                                                 | :heavy_minus_sign:                                                                        | N/A                                                                                       |                                                                                           |
| `payload`                                                                                 | *string*                                                                                  | :heavy_minus_sign:                                                                        | Base64 encoded string of the partial payload JSON object                                  | btoa(JSON.stringify({ foo: 123 })) results in base64 encoded string like eyJmb28iOjEyM30= |
| `idempotencyKey`                                                                          | *string*                                                                                  | :heavy_minus_sign:                                                                        | A header for idempotency purposes                                                         |                                                                                           |