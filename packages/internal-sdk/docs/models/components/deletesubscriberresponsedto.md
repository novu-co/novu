# DeleteSubscriberResponseDto

## Example Usage

```typescript
import { DeleteSubscriberResponseDto } from "@novu/api/models/components";

let value: DeleteSubscriberResponseDto = {
  acknowledged: false,
  status: "deleted",
};
```

## Fields

| Field                                                                                                        | Type                                                                                                         | Required                                                                                                     | Description                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `acknowledged`                                                                                               | *boolean*                                                                                                    | :heavy_check_mark:                                                                                           | A boolean stating the success of the action                                                                  |
| `status`                                                                                                     | [components.DeleteSubscriberResponseDtoStatus](../../models/components/deletesubscriberresponsedtostatus.md) | :heavy_check_mark:                                                                                           | The status enum for the performed action                                                                     |