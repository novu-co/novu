# WorkflowControllerPatchWorkflowStepDataRequest

## Example Usage

```typescript
import { WorkflowControllerPatchWorkflowStepDataRequest } from "@novu/api/models/operations";

let value: WorkflowControllerPatchWorkflowStepDataRequest = {
  workflowId: "<id>",
  stepId: "<id>",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `workflowId`                      | *string*                          | :heavy_check_mark:                | N/A                               |
| `stepId`                          | *string*                          | :heavy_check_mark:                | N/A                               |
| `idempotencyKey`                  | *string*                          | :heavy_minus_sign:                | A header for idempotency purposes |