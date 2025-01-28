# TriggerEventResponseDto

## Example Usage

```typescript
import { TriggerEventResponseDto } from "@novu/api/models/components";

let value: TriggerEventResponseDto = {
  acknowledged: false,
  status: "trigger_not_active",
};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `acknowledged`                                                    | *boolean*                                                         | :heavy_check_mark:                                                | Indicates whether the trigger was acknowledged or not             |
| `status`                                                          | [components.Status](../../models/components/status.md)            | :heavy_check_mark:                                                | Status of the trigger                                             |
| `error`                                                           | *string*[]                                                        | :heavy_minus_sign:                                                | In case of an error, this field will contain the error message(s) |
| `transactionId`                                                   | *string*                                                          | :heavy_minus_sign:                                                | The returned transaction ID of the trigger                        |