# NotificationTriggerVariableResponse

## Example Usage

```typescript
import { NotificationTriggerVariableResponse } from "@novu/api/models/components";

let value: NotificationTriggerVariableResponse = {
  name: "<value>",
};
```

## Fields

| Field                                                                                                                      | Type                                                                                                                       | Required                                                                                                                   | Description                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `name`                                                                                                                     | *string*                                                                                                                   | :heavy_check_mark:                                                                                                         | The name of the variable                                                                                                   |
| `value`                                                                                                                    | [components.NotificationTriggerVariableResponseValue](../../models/components/notificationtriggervariableresponsevalue.md) | :heavy_minus_sign:                                                                                                         | The value of the variable                                                                                                  |
| `type`                                                                                                                     | [components.NotificationTriggerVariableResponseType](../../models/components/notificationtriggervariableresponsetype.md)   | :heavy_minus_sign:                                                                                                         | The type of the variable                                                                                                   |