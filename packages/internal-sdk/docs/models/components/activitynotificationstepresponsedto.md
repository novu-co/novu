# ActivityNotificationStepResponseDto

## Example Usage

```typescript
import { ActivityNotificationStepResponseDto } from "@novu/api/models/components";

let value: ActivityNotificationStepResponseDto = {
  id: "<id>",
  active: false,
  filters: [
    {
      isNegated: false,
      type: "MULTI_LIST",
      value: "OR",
      children: [
        {
          field: "<value>",
          value: "<value>",
          operator: "EQUAL",
          on: "payload",
        },
      ],
    },
  ],
  templateId: "<id>",
};
```

## Fields

| Field                                                                                                                                      | Type                                                                                                                                       | Required                                                                                                                                   | Description                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                                                                                                                       | *string*                                                                                                                                   | :heavy_check_mark:                                                                                                                         | Unique identifier of the step                                                                                                              |
| `active`                                                                                                                                   | *boolean*                                                                                                                                  | :heavy_check_mark:                                                                                                                         | Whether the step is active or not                                                                                                          |
| `replyCallback`                                                                                                                            | [components.ActivityNotificationStepResponseDtoReplyCallback](../../models/components/activitynotificationstepresponsedtoreplycallback.md) | :heavy_minus_sign:                                                                                                                         | Reply callback settings                                                                                                                    |
| `controlVariables`                                                                                                                         | [components.ControlVariables](../../models/components/controlvariables.md)                                                                 | :heavy_minus_sign:                                                                                                                         | Control variables                                                                                                                          |
| `metadata`                                                                                                                                 | [components.Metadata](../../models/components/metadata.md)                                                                                 | :heavy_minus_sign:                                                                                                                         | Metadata for the workflow step                                                                                                             |
| `issues`                                                                                                                                   | [components.Issues](../../models/components/issues.md)                                                                                     | :heavy_minus_sign:                                                                                                                         | Step issues                                                                                                                                |
| `filters`                                                                                                                                  | [components.StepFilterDto](../../models/components/stepfilterdto.md)[]                                                                     | :heavy_check_mark:                                                                                                                         | Filter criteria for the step                                                                                                               |
| `template`                                                                                                                                 | [components.MessageTemplateDto](../../models/components/messagetemplatedto.md)                                                             | :heavy_minus_sign:                                                                                                                         | Optional template for the step                                                                                                             |
| `variants`                                                                                                                                 | [components.ActivityNotificationStepResponseDto](../../models/components/activitynotificationstepresponsedto.md)[]                         | :heavy_minus_sign:                                                                                                                         | Variants of the step                                                                                                                       |
| `templateId`                                                                                                                               | *string*                                                                                                                                   | :heavy_check_mark:                                                                                                                         | The identifier for the template associated with this step                                                                                  |
| `name`                                                                                                                                     | *string*                                                                                                                                   | :heavy_minus_sign:                                                                                                                         | The name of the step                                                                                                                       |
| `parentId`                                                                                                                                 | *string*                                                                                                                                   | :heavy_minus_sign:                                                                                                                         | The unique identifier for the parent step                                                                                                  |