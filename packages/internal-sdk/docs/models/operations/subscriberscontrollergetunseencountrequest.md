# SubscribersControllerGetUnseenCountRequest

## Example Usage

```typescript
import { SubscribersControllerGetUnseenCountRequest } from "@novu/api/models/operations";

let value: SubscribersControllerGetUnseenCountRequest = {
  subscriberId: "<id>",
};
```

## Fields

| Field                                          | Type                                           | Required                                       | Description                                    |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `subscriberId`                                 | *string*                                       | :heavy_check_mark:                             | N/A                                            |
| `seen`                                         | *boolean*                                      | :heavy_minus_sign:                             | Indicates whether to count seen notifications. |
| `limit`                                        | *number*                                       | :heavy_minus_sign:                             | The maximum number of notifications to return. |
| `idempotencyKey`                               | *string*                                       | :heavy_minus_sign:                             | A header for idempotency purposes              |