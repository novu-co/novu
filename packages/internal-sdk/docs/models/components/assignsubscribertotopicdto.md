# AssignSubscriberToTopicDto

## Example Usage

```typescript
import { AssignSubscriberToTopicDto } from "@novu/api/models/components";

let value: AssignSubscriberToTopicDto = {
  succeeded: [
    "<value>",
  ],
};
```

## Fields

| Field                                                                              | Type                                                                               | Required                                                                           | Description                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `succeeded`                                                                        | *string*[]                                                                         | :heavy_check_mark:                                                                 | List of successfully assigned subscriber IDs                                       |
| `failed`                                                                           | [components.FailedAssignmentsDto](../../models/components/failedassignmentsdto.md) | :heavy_minus_sign:                                                                 | Details about failed assignments                                                   |