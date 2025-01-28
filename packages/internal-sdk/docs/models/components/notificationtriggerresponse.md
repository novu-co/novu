# NotificationTriggerResponse

## Example Usage

```typescript
import { NotificationTriggerResponse } from "@novu/api/models/components";

let value: NotificationTriggerResponse = {
  type: "event",
  identifier: "<value>",
  variables: [
    {
      name: "<value>",
    },
  ],
};
```

## Fields

| Field                                                                                                              | Type                                                                                                               | Required                                                                                                           | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `type`                                                                                                             | [components.TriggerTypeEnum](../../models/components/triggertypeenum.md)                                           | :heavy_check_mark:                                                                                                 | The type of the trigger                                                                                            |
| `identifier`                                                                                                       | *string*                                                                                                           | :heavy_check_mark:                                                                                                 | The identifier of the trigger                                                                                      |
| `variables`                                                                                                        | [components.NotificationTriggerVariableResponse](../../models/components/notificationtriggervariableresponse.md)[] | :heavy_check_mark:                                                                                                 | The variables of the trigger                                                                                       |
| `subscriberVariables`                                                                                              | [components.NotificationTriggerVariableResponse](../../models/components/notificationtriggervariableresponse.md)[] | :heavy_minus_sign:                                                                                                 | The subscriber variables of the trigger                                                                            |
| `reservedVariables`                                                                                                | [components.TriggerReservedVariableResponse](../../models/components/triggerreservedvariableresponse.md)[]         | :heavy_minus_sign:                                                                                                 | The reserved variables of the trigger                                                                              |