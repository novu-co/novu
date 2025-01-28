# To

The recipients list of people who will receive the notification.


## Supported Types

### `components.One[]`

```typescript
const value: components.One[] = [
  {
    topicKey: "<value>",
    type: "Subscriber",
  },
];
```

### `string`

```typescript
const value: string = "SUBSCRIBER_ID";
```

### `components.SubscriberPayloadDto`

```typescript
const value: components.SubscriberPayloadDto = {
  subscriberId: "<id>",
};
```

### `components.TopicPayloadDto`

```typescript
const value: components.TopicPayloadDto = {
  topicKey: "<value>",
  type: "Topic",
};
```

