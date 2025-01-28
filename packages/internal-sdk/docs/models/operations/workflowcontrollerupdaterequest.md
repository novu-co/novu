# WorkflowControllerUpdateRequest

## Example Usage

```typescript
import { WorkflowControllerUpdateRequest } from "@novu/api/models/operations";

let value: WorkflowControllerUpdateRequest = {
  workflowId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `workflowId`                      | *string*                          | :heavy_check_mark:                | N/A                               |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |