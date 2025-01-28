# TriggerReservedVariableResponse

## Example Usage

```typescript
import { TriggerReservedVariableResponse } from "@novu/api/models/components";

let value: TriggerReservedVariableResponse = {
  type: "actor",
  variables: [
    "<value>",
  ],
};
```

## Fields

| Field                                                                                                            | Type                                                                                                             | Required                                                                                                         | Description                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `type`                                                                                                           | [components.TriggerReservedVariableResponseType](../../models/components/triggerreservedvariableresponsetype.md) | :heavy_check_mark:                                                                                               | The type of the reserved variable                                                                                |
| `variables`                                                                                                      | *string*[]                                                                                                       | :heavy_check_mark:                                                                                               | The reserved variables of the trigger                                                                            |