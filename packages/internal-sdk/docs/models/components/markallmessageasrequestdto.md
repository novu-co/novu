# MarkAllMessageAsRequestDto

## Example Usage

```typescript
import { MarkAllMessageAsRequestDto } from "@novu/api/models/components";

let value: MarkAllMessageAsRequestDto = {
  markAs: "unseen",
};
```

## Fields

| Field                                                                                                      | Type                                                                                                       | Required                                                                                                   | Description                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `feedIdentifier`                                                                                           | *components.FeedIdentifier*                                                                                | :heavy_minus_sign:                                                                                         | Optional feed identifier or array of feed identifiers                                                      |
| `markAs`                                                                                                   | [components.MarkAllMessageAsRequestDtoMarkAs](../../models/components/markallmessageasrequestdtomarkas.md) | :heavy_check_mark:                                                                                         | Mark all subscriber messages as read, unread, seen or unseen                                               |