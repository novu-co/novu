# WorkflowControllerGetWorkflowTestDataRequest

## Example Usage

```typescript
import { WorkflowControllerGetWorkflowTestDataRequest } from "@novu/api/models/operations";

let value: WorkflowControllerGetWorkflowTestDataRequest = {
  workflowId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `workflowId`                      | *string*                          | :heavy_check_mark:                | N/A                               |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |