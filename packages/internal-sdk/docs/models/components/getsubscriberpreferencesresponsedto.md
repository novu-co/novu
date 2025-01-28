# GetSubscriberPreferencesResponseDto

## Example Usage

```typescript
import { GetSubscriberPreferencesResponseDto } from "@novu/api/models/components";

let value: GetSubscriberPreferencesResponseDto = {
  preference: {
    enabled: false,
    channels: {},
  },
};
```

## Fields

| Field                                                                      | Type                                                                       | Required                                                                   | Description                                                                |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `template`                                                                 | [components.TemplateResponse](../../models/components/templateresponse.md) | :heavy_minus_sign:                                                         | The workflow information and if it is critical or not                      |
| `preference`                                                               | [components.Preference](../../models/components/preference.md)             | :heavy_check_mark:                                                         | The preferences of the subscriber regarding the related workflow           |