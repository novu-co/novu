# IntegrationsControllerUpdateIntegrationByIdResponse

## Example Usage

```typescript
import { IntegrationsControllerUpdateIntegrationByIdResponse } from "@novu/api/models/operations";

let value: IntegrationsControllerUpdateIntegrationByIdResponse = {
  headers: {
    "key": [
      "<value>",
    ],
  },
  result: {
    environmentId: "<id>",
    organizationId: "<id>",
    name: "<value>",
    identifier: "<value>",
    providerId: "<id>",
    channel: "in_app",
    credentials: {},
    active: false,
    deleted: false,
    primary: false,
  },
};
```

## Fields

| Field                                                                                  | Type                                                                                   | Required                                                                               | Description                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `headers`                                                                              | Record<string, *string*[]>                                                             | :heavy_check_mark:                                                                     | N/A                                                                                    |
| `result`                                                                               | [components.IntegrationResponseDto](../../models/components/integrationresponsedto.md) | :heavy_check_mark:                                                                     | N/A                                                                                    |