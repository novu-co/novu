# UpdateSubscriberPreferenceResponseDto

## Example Usage

```typescript
import { UpdateSubscriberPreferenceResponseDto } from "@novu/api/models/components";

let value: UpdateSubscriberPreferenceResponseDto = {
  template: {
    id: "<id>",
    name: "<value>",
    critical: false,
    triggers: [
      {
        type: "event",
        identifier: "<value>",
        variables: [
          {
            name: "<value>",
          },
        ],
      },
    ],
  },
  preference: {
    enabled: false,
    channels: {},
  },
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `template`                                                                 | [components.TemplateResponse](../../models/components/templateresponse.md) | :heavy_check_mark:                                                         | The workflow information and if it is critical or not                      |
| `preference`                                                               | [components.Preference](../../models/components/preference.md)             | :heavy_check_mark:                                                         | The preferences of the subscriber regarding the related workflow           |