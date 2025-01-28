# WorkflowToStepControlValuesDto

## Example Usage

```typescript
import { WorkflowToStepControlValuesDto } from "@novu/api/models/components";

let value: WorkflowToStepControlValuesDto = {};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `steps`                                            | Record<string, Record<string, *any*>>              | :heavy_minus_sign:                                 | A mapping of step IDs to their corresponding data. |