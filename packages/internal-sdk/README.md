# @novu/api

Developer-friendly & type-safe Typescript SDK specifically catered to leverage *@novu/api* API.

<div align="left">
    <a href="https://www.speakeasy.com/?utm_source=@novu/api&utm_campaign=typescript"><img src="https://custom-icon-badges.demolab.com/badge/-Built%20By%20Speakeasy-212015?style=for-the-badge&logoColor=FBE331&logo=speakeasy&labelColor=545454" /></a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-blue.svg" style="width: 100px; height: 28px;" />
    </a>
</div>


<br /><br />
> [!IMPORTANT]
> This SDK is not yet ready for production use. To complete setup please follow the steps outlined in your [workspace](https://app.speakeasy.com/org/novu/novu). Delete this section before > publishing to a package manager.

<!-- Start Summary [summary] -->
## Summary

Novu API: Novu REST API. Please see https://docs.novu.co/api-reference for more details.

For more information about the API: [Novu Documentation](https://docs.novu.co)
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [@novu/api](#novuapi)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [React hooks with TanStack Query](#react-hooks-with-tanstack-query)
  * [Pagination](#pagination)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

> [!TIP]
> To finish publishing your SDK to npm and others you must [run your first generation action](https://www.speakeasy.com/docs/github-setup#step-by-step-guide).


The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add <UNSET>
# Install optional peer dependencies if you plan to use React hooks
npm add @tanstack/react-query react react-dom
```

### PNPM

```bash
pnpm add <UNSET>
# Install optional peer dependencies if you plan to use React hooks
pnpm add @tanstack/react-query react react-dom
```

### Bun

```bash
bun add <UNSET>
# Install optional peer dependencies if you plan to use React hooks
bun add @tanstack/react-query react react-dom
```

### Yarn

```bash
yarn add <UNSET> zod
# Install optional peer dependencies if you plan to use React hooks
yarn add @tanstack/react-query react react-dom

# Note that Yarn does not install peer dependencies automatically. You will need
# to install zod as shown above.
```
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Trigger Notification Event

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  });

  // Handle the result
  console.log(result);
}

run();

```

### Trigger Notification Events in Bulk

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.triggerBulk({
    events: [
      {
        name: "workflow_identifier",
        payload: {
          "comment_id": "string",
          "post": {
            "text": "string",
          },
        },
        bridgeUrl: "https://example.com/bridge",
        overrides: {
          "fcm": {
            "data": {
              "key": "value",
            },
          },
        },
        to: {
          subscriberId: "<id>",
        },
        actor: {
          subscriberId: "<id>",
        },
        tenant: {},
      },
      {
        name: "workflow_identifier",
        payload: {
          "comment_id": "string",
          "post": {
            "text": "string",
          },
        },
        bridgeUrl: "https://example.com/bridge",
        overrides: {
          "fcm": {
            "data": {
              "key": "value",
            },
          },
        },
        to: [
          {
            topicKey: "<value>",
            type: "Subscriber",
          },
        ],
        actor: {
          subscriberId: "<id>",
        },
        tenant: "<value>",
      },
      {
        name: "workflow_identifier",
        payload: {
          "comment_id": "string",
          "post": {
            "text": "string",
          },
        },
        bridgeUrl: "https://example.com/bridge",
        overrides: {
          "fcm": {
            "data": {
              "key": "value",
            },
          },
        },
        to: [
          "SUBSCRIBER_ID",
          "SUBSCRIBER_ID",
        ],
        actor: "<value>",
        tenant: {},
      },
    ],
  });

  // Handle the result
  console.log(result);
}

run();

```

### Broadcast Event to All

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.triggerBroadcast({
    name: "<value>",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    transactionId: "<id>",
    actor: "<value>",
    tenant: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();

```

### Cancel Triggered Event

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.cancel("<id>");

  // Handle the result
  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security schemes globally:

| Name         | Type   | Scheme      |
| ------------ | ------ | ----------- |
| `apiKey`     | apiKey | API key     |
| `bearerAuth` | http   | HTTP Bearer |

You can set the security parameters through the `security` optional parameter when initializing the SDK client instance. The selected scheme will be used by default to authenticate with the API for all operations that support it. For example:
```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [integrations](docs/sdks/integrations/README.md)

* [list](docs/sdks/integrations/README.md#list) - Get integrations
* [create](docs/sdks/integrations/README.md#create) - Create integration
* [listActive](docs/sdks/integrations/README.md#listactive) - Get active integrations
* [update](docs/sdks/integrations/README.md#update) - Update integration
* [delete](docs/sdks/integrations/README.md#delete) - Delete integration
* [setAsPrimary](docs/sdks/integrations/README.md#setasprimary) - Set integration as primary

#### [integrations.webhooks](docs/sdks/webhooks/README.md)

* [retrieve](docs/sdks/webhooks/README.md#retrieve) - Get webhook support status for provider

### [messages](docs/sdks/messages/README.md)

* [retrieve](docs/sdks/messages/README.md#retrieve) - Get messages
* [delete](docs/sdks/messages/README.md#delete) - Delete message
* [deleteByTransactionId](docs/sdks/messages/README.md#deletebytransactionid) - Delete messages by transactionId

### [notifications](docs/sdks/notifications/README.md)

* [list](docs/sdks/notifications/README.md#list) - Get notifications
* [retrieve](docs/sdks/notifications/README.md#retrieve) - Get notification

#### [notifications.stats](docs/sdks/stats/README.md)

* [retrieve](docs/sdks/stats/README.md#retrieve) - Get notification statistics
* [graph](docs/sdks/stats/README.md#graph) - Get notification graph statistics

### [Novu SDK](docs/sdks/novu/README.md)

* [trigger](docs/sdks/novu/README.md#trigger) - Trigger event
* [triggerBulk](docs/sdks/novu/README.md#triggerbulk) - Bulk trigger event
* [triggerBroadcast](docs/sdks/novu/README.md#triggerbroadcast) - Broadcast event to all
* [cancel](docs/sdks/novu/README.md#cancel) - Cancel triggered event

### [subscribers](docs/sdks/subscribers/README.md)

* [list](docs/sdks/subscribers/README.md#list) - Get subscribers
* [create](docs/sdks/subscribers/README.md#create) - Create subscriber
* [retrieve](docs/sdks/subscribers/README.md#retrieve) - Get subscriber
* [update](docs/sdks/subscribers/README.md#update) - Update subscriber
* [delete](docs/sdks/subscribers/README.md#delete) - Delete subscriber
* [createBulk](docs/sdks/subscribers/README.md#createbulk) - Bulk create subscribers

#### [subscribers.authentication](docs/sdks/authentication/README.md)

* [chatAccessOauthCallBack](docs/sdks/authentication/README.md#chataccessoauthcallback) - Handle providers oauth redirect
* [chatAccessOauth](docs/sdks/authentication/README.md#chataccessoauth) - Handle chat oauth

#### [subscribers.credentials](docs/sdks/credentials/README.md)

* [update](docs/sdks/credentials/README.md#update) - Update subscriber credentials
* [append](docs/sdks/credentials/README.md#append) - Modify subscriber credentials
* [delete](docs/sdks/credentials/README.md#delete) - Delete subscriber credentials by providerId

#### [subscribers.messages](docs/sdks/novumessages/README.md)

* [markAllAs](docs/sdks/novumessages/README.md#markallas) - Mark a subscriber messages as seen, read, unseen or unread
* [markAll](docs/sdks/novumessages/README.md#markall) - Marks all the subscriber messages as read, unread, seen or unseen. Optionally you can pass feed id (or array) to mark messages of a particular feed.
* [updateAsSeen](docs/sdks/novumessages/README.md#updateasseen) - Mark message action as seen

#### [subscribers.notifications](docs/sdks/novunotifications/README.md)

* [feed](docs/sdks/novunotifications/README.md#feed) - Get in-app notification feed for a particular subscriber
* [unseenCount](docs/sdks/novunotifications/README.md#unseencount) - Get the unseen in-app notifications count for subscribers feed

#### [subscribers.preferences](docs/sdks/preferences/README.md)

* [list](docs/sdks/preferences/README.md#list) - Get subscriber preferences
* [updateGlobal](docs/sdks/preferences/README.md#updateglobal) - Update subscriber global preferences
* [retrieveByLevel](docs/sdks/preferences/README.md#retrievebylevel) - Get subscriber preferences by level
* [update](docs/sdks/preferences/README.md#update) - Update subscriber preference

#### [subscribers.properties](docs/sdks/properties/README.md)

* [updateOnlineFlag](docs/sdks/properties/README.md#updateonlineflag) - Update subscriber online status

### [topics](docs/sdks/topics/README.md)

* [create](docs/sdks/topics/README.md#create) - Topic creation
* [list](docs/sdks/topics/README.md#list) - Get topic list filtered 
* [delete](docs/sdks/topics/README.md#delete) - Delete topic
* [retrieve](docs/sdks/topics/README.md#retrieve) - Get topic
* [rename](docs/sdks/topics/README.md#rename) - Rename a topic

#### [topics.subscribers](docs/sdks/novusubscribers/README.md)

* [assign](docs/sdks/novusubscribers/README.md#assign) - Subscribers addition
* [retrieve](docs/sdks/novusubscribers/README.md#retrieve) - Check topic subscriber
* [remove](docs/sdks/novusubscribers/README.md#remove) - Subscribers removal

### [workflows](docs/sdks/workflows/README.md)

* [create](docs/sdks/workflows/README.md#create)
* [workflowControllerSearchWorkflows](docs/sdks/workflows/README.md#workflowcontrollersearchworkflows)
* [workflowControllerSync](docs/sdks/workflows/README.md#workflowcontrollersync)
* [update](docs/sdks/workflows/README.md#update)
* [retrieve](docs/sdks/workflows/README.md#retrieve)
* [delete](docs/sdks/workflows/README.md#delete)
* [workflowControllerPatchWorkflow](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflow)
* [workflowControllerGeneratePreview](docs/sdks/workflows/README.md#workflowcontrollergeneratepreview)
* [getStepData](docs/sdks/workflows/README.md#getstepdata)
* [workflowControllerPatchWorkflowStepData](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflowstepdata)
* [getWorkflowTestData](docs/sdks/workflows/README.md#getworkflowtestdata)

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`cancel`](docs/sdks/novu/README.md#cancel) - Cancel triggered event
- [`integrationsCreate`](docs/sdks/integrations/README.md#create) - Create integration
- [`integrationsDelete`](docs/sdks/integrations/README.md#delete) - Delete integration
- [`integrationsList`](docs/sdks/integrations/README.md#list) - Get integrations
- [`integrationsListActive`](docs/sdks/integrations/README.md#listactive) - Get active integrations
- [`integrationsSetAsPrimary`](docs/sdks/integrations/README.md#setasprimary) - Set integration as primary
- [`integrationsUpdate`](docs/sdks/integrations/README.md#update) - Update integration
- [`integrationsWebhooksRetrieve`](docs/sdks/webhooks/README.md#retrieve) - Get webhook support status for provider
- [`messagesDelete`](docs/sdks/messages/README.md#delete) - Delete message
- [`messagesDeleteByTransactionId`](docs/sdks/messages/README.md#deletebytransactionid) - Delete messages by transactionId
- [`messagesRetrieve`](docs/sdks/messages/README.md#retrieve) - Get messages
- [`notificationsList`](docs/sdks/notifications/README.md#list) - Get notifications
- [`notificationsRetrieve`](docs/sdks/notifications/README.md#retrieve) - Get notification
- [`notificationsStatsGraph`](docs/sdks/stats/README.md#graph) - Get notification graph statistics
- [`notificationsStatsRetrieve`](docs/sdks/stats/README.md#retrieve) - Get notification statistics
- [`subscribersAuthenticationChatAccessOauth`](docs/sdks/authentication/README.md#chataccessoauth) - Handle chat oauth
- [`subscribersAuthenticationChatAccessOauthCallBack`](docs/sdks/authentication/README.md#chataccessoauthcallback) - Handle providers oauth redirect
- [`subscribersCreate`](docs/sdks/subscribers/README.md#create) - Create subscriber
- [`subscribersCreateBulk`](docs/sdks/subscribers/README.md#createbulk) - Bulk create subscribers
- [`subscribersCredentialsAppend`](docs/sdks/credentials/README.md#append) - Modify subscriber credentials
- [`subscribersCredentialsDelete`](docs/sdks/credentials/README.md#delete) - Delete subscriber credentials by providerId
- [`subscribersCredentialsUpdate`](docs/sdks/credentials/README.md#update) - Update subscriber credentials
- [`subscribersDelete`](docs/sdks/subscribers/README.md#delete) - Delete subscriber
- [`subscribersList`](docs/sdks/subscribers/README.md#list) - Get subscribers
- [`subscribersMessagesMarkAll`](docs/sdks/novumessages/README.md#markall) - Marks all the subscriber messages as read, unread, seen or unseen. Optionally you can pass feed id (or array) to mark messages of a particular feed.
- [`subscribersMessagesMarkAllAs`](docs/sdks/novumessages/README.md#markallas) - Mark a subscriber messages as seen, read, unseen or unread
- [`subscribersMessagesUpdateAsSeen`](docs/sdks/novumessages/README.md#updateasseen) - Mark message action as seen
- [`subscribersNotificationsFeed`](docs/sdks/novunotifications/README.md#feed) - Get in-app notification feed for a particular subscriber
- [`subscribersNotificationsUnseenCount`](docs/sdks/novunotifications/README.md#unseencount) - Get the unseen in-app notifications count for subscribers feed
- [`subscribersPreferencesList`](docs/sdks/preferences/README.md#list) - Get subscriber preferences
- [`subscribersPreferencesRetrieveByLevel`](docs/sdks/preferences/README.md#retrievebylevel) - Get subscriber preferences by level
- [`subscribersPreferencesUpdate`](docs/sdks/preferences/README.md#update) - Update subscriber preference
- [`subscribersPreferencesUpdateGlobal`](docs/sdks/preferences/README.md#updateglobal) - Update subscriber global preferences
- [`subscribersPropertiesUpdateOnlineFlag`](docs/sdks/properties/README.md#updateonlineflag) - Update subscriber online status
- [`subscribersRetrieve`](docs/sdks/subscribers/README.md#retrieve) - Get subscriber
- [`subscribersUpdate`](docs/sdks/subscribers/README.md#update) - Update subscriber
- [`topicsCreate`](docs/sdks/topics/README.md#create) - Topic creation
- [`topicsDelete`](docs/sdks/topics/README.md#delete) - Delete topic
- [`topicsList`](docs/sdks/topics/README.md#list) - Get topic list filtered 
- [`topicsRename`](docs/sdks/topics/README.md#rename) - Rename a topic
- [`topicsRetrieve`](docs/sdks/topics/README.md#retrieve) - Get topic
- [`topicsSubscribersAssign`](docs/sdks/novusubscribers/README.md#assign) - Subscribers addition
- [`topicsSubscribersRemove`](docs/sdks/novusubscribers/README.md#remove) - Subscribers removal
- [`topicsSubscribersRetrieve`](docs/sdks/novusubscribers/README.md#retrieve) - Check topic subscriber
- [`trigger`](docs/sdks/novu/README.md#trigger) - Trigger event
- [`triggerBroadcast`](docs/sdks/novu/README.md#triggerbroadcast) - Broadcast event to all
- [`triggerBulk`](docs/sdks/novu/README.md#triggerbulk) - Bulk trigger event
- [`workflowsCreate`](docs/sdks/workflows/README.md#create)
- [`workflowsDelete`](docs/sdks/workflows/README.md#delete)
- [`workflowsGetStepData`](docs/sdks/workflows/README.md#getstepdata)
- [`workflowsGetWorkflowTestData`](docs/sdks/workflows/README.md#getworkflowtestdata)
- [`workflowsRetrieve`](docs/sdks/workflows/README.md#retrieve)
- [`workflowsUpdate`](docs/sdks/workflows/README.md#update)
- [`workflowsWorkflowControllerGeneratePreview`](docs/sdks/workflows/README.md#workflowcontrollergeneratepreview)
- [`workflowsWorkflowControllerPatchWorkflow`](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflow)
- [`workflowsWorkflowControllerPatchWorkflowStepData`](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflowstepdata)
- [`workflowsWorkflowControllerSearchWorkflows`](docs/sdks/workflows/README.md#workflowcontrollersearchworkflows)
- [`workflowsWorkflowControllerSync`](docs/sdks/workflows/README.md#workflowcontrollersync)

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start React hooks with TanStack Query [react-query] -->
## React hooks with TanStack Query

React hooks built on [TanStack Query][tanstack-query] are included in this SDK.
These hooks and the utility functions provided alongside them can be used to
build rich applications that pull data from the API using one of the most
popular asynchronous state management library.

[tanstack-query]: https://tanstack.com/query/v5/docs/framework/react/overview

To learn about this feature and how to get started, check
[REACT_QUERY.md](./REACT_QUERY.md).

> [!WARNING]
>
> This feature is currently in **preview** and is subject to breaking changes
> within the current major version of the SDK as we gather user feedback on it.

<details>

<summary>Available React hooks</summary>

- [`useCancelMutation`](docs/sdks/novu/README.md#cancel) - Cancel triggered event
- [`useIntegrationsCreateMutation`](docs/sdks/integrations/README.md#create) - Create integration
- [`useIntegrationsDeleteMutation`](docs/sdks/integrations/README.md#delete) - Delete integration
- [`useIntegrationsList`](docs/sdks/integrations/README.md#list) - Get integrations
- [`useIntegrationsListActive`](docs/sdks/integrations/README.md#listactive) - Get active integrations
- [`useIntegrationsSetAsPrimaryMutation`](docs/sdks/integrations/README.md#setasprimary) - Set integration as primary
- [`useIntegrationsUpdateMutation`](docs/sdks/integrations/README.md#update) - Update integration
- [`useIntegrationsWebhooksRetrieve`](docs/sdks/webhooks/README.md#retrieve) - Get webhook support status for provider
- [`useMessagesDeleteByTransactionIdMutation`](docs/sdks/messages/README.md#deletebytransactionid) - Delete messages by transactionId
- [`useMessagesDeleteMutation`](docs/sdks/messages/README.md#delete) - Delete message
- [`useMessagesRetrieve`](docs/sdks/messages/README.md#retrieve) - Get messages
- [`useNotificationsList`](docs/sdks/notifications/README.md#list) - Get notifications
- [`useNotificationsRetrieve`](docs/sdks/notifications/README.md#retrieve) - Get notification
- [`useNotificationsStatsGraph`](docs/sdks/stats/README.md#graph) - Get notification graph statistics
- [`useNotificationsStatsRetrieve`](docs/sdks/stats/README.md#retrieve) - Get notification statistics
- [`useSubscribersAuthenticationChatAccessOauth`](docs/sdks/authentication/README.md#chataccessoauth) - Handle chat oauth
- [`useSubscribersAuthenticationChatAccessOauthCallBack`](docs/sdks/authentication/README.md#chataccessoauthcallback) - Handle providers oauth redirect
- [`useSubscribersCreateBulkMutation`](docs/sdks/subscribers/README.md#createbulk) - Bulk create subscribers
- [`useSubscribersCreateMutation`](docs/sdks/subscribers/README.md#create) - Create subscriber
- [`useSubscribersCredentialsAppendMutation`](docs/sdks/credentials/README.md#append) - Modify subscriber credentials
- [`useSubscribersCredentialsDeleteMutation`](docs/sdks/credentials/README.md#delete) - Delete subscriber credentials by providerId
- [`useSubscribersCredentialsUpdateMutation`](docs/sdks/credentials/README.md#update) - Update subscriber credentials
- [`useSubscribersDeleteMutation`](docs/sdks/subscribers/README.md#delete) - Delete subscriber
- [`useSubscribersList`](docs/sdks/subscribers/README.md#list) - Get subscribers
- [`useSubscribersMessagesMarkAllAsMutation`](docs/sdks/novumessages/README.md#markallas) - Mark a subscriber messages as seen, read, unseen or unread
- [`useSubscribersMessagesMarkAllMutation`](docs/sdks/novumessages/README.md#markall) - Marks all the subscriber messages as read, unread, seen or unseen. Optionally you can pass feed id (or array) to mark messages of a particular feed.
- [`useSubscribersMessagesUpdateAsSeenMutation`](docs/sdks/novumessages/README.md#updateasseen) - Mark message action as seen
- [`useSubscribersNotificationsFeed`](docs/sdks/novunotifications/README.md#feed) - Get in-app notification feed for a particular subscriber
- [`useSubscribersNotificationsUnseenCount`](docs/sdks/novunotifications/README.md#unseencount) - Get the unseen in-app notifications count for subscribers feed
- [`useSubscribersPreferencesList`](docs/sdks/preferences/README.md#list) - Get subscriber preferences
- [`useSubscribersPreferencesRetrieveByLevel`](docs/sdks/preferences/README.md#retrievebylevel) - Get subscriber preferences by level
- [`useSubscribersPreferencesUpdateGlobalMutation`](docs/sdks/preferences/README.md#updateglobal) - Update subscriber global preferences
- [`useSubscribersPreferencesUpdateMutation`](docs/sdks/preferences/README.md#update) - Update subscriber preference
- [`useSubscribersPropertiesUpdateOnlineFlagMutation`](docs/sdks/properties/README.md#updateonlineflag) - Update subscriber online status
- [`useSubscribersRetrieve`](docs/sdks/subscribers/README.md#retrieve) - Get subscriber
- [`useSubscribersUpdateMutation`](docs/sdks/subscribers/README.md#update) - Update subscriber
- [`useTopicsCreateMutation`](docs/sdks/topics/README.md#create) - Topic creation
- [`useTopicsDeleteMutation`](docs/sdks/topics/README.md#delete) - Delete topic
- [`useTopicsList`](docs/sdks/topics/README.md#list) - Get topic list filtered 
- [`useTopicsRenameMutation`](docs/sdks/topics/README.md#rename) - Rename a topic
- [`useTopicsRetrieve`](docs/sdks/topics/README.md#retrieve) - Get topic
- [`useTopicsSubscribersAssignMutation`](docs/sdks/novusubscribers/README.md#assign) - Subscribers addition
- [`useTopicsSubscribersRemoveMutation`](docs/sdks/novusubscribers/README.md#remove) - Subscribers removal
- [`useTopicsSubscribersRetrieve`](docs/sdks/novusubscribers/README.md#retrieve) - Check topic subscriber
- [`useTriggerBroadcastMutation`](docs/sdks/novu/README.md#triggerbroadcast) - Broadcast event to all
- [`useTriggerBulkMutation`](docs/sdks/novu/README.md#triggerbulk) - Bulk trigger event
- [`useTriggerMutation`](docs/sdks/novu/README.md#trigger) - Trigger event
- [`useWorkflowsCreateMutation`](docs/sdks/workflows/README.md#create)
- [`useWorkflowsDeleteMutation`](docs/sdks/workflows/README.md#delete)
- [`useWorkflowsGetStepData`](docs/sdks/workflows/README.md#getstepdata)
- [`useWorkflowsGetWorkflowTestData`](docs/sdks/workflows/README.md#getworkflowtestdata)
- [`useWorkflowsRetrieve`](docs/sdks/workflows/README.md#retrieve)
- [`useWorkflowsUpdateMutation`](docs/sdks/workflows/README.md#update)
- [`useWorkflowsWorkflowControllerGeneratePreviewMutation`](docs/sdks/workflows/README.md#workflowcontrollergeneratepreview)
- [`useWorkflowsWorkflowControllerPatchWorkflowMutation`](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflow)
- [`useWorkflowsWorkflowControllerPatchWorkflowStepDataMutation`](docs/sdks/workflows/README.md#workflowcontrollerpatchworkflowstepdata)
- [`useWorkflowsWorkflowControllerSearchWorkflows`](docs/sdks/workflows/README.md#workflowcontrollersearchworkflows)
- [`useWorkflowsWorkflowControllerSyncMutation`](docs/sdks/workflows/README.md#workflowcontrollersync)

</details>
<!-- End React hooks with TanStack Query [react-query] -->

<!-- Start Pagination [pagination] -->
## Pagination

Some of the endpoints in this SDK support pagination. To use pagination, you
make your SDK calls as usual, but the returned response object will also be an
async iterable that can be consumed using the [`for await...of`][for-await-of]
syntax.

[for-await-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of

Here's an example of one such pagination call:

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.subscribers.list(10);

  for await (const page of result) {
    // Handle the page
    console.log(page);
  }
}

run();

```
<!-- End Pagination [pagination] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  }, {
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  // Handle the result
  console.log(result);
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

Some methods specify known errors which can be thrown. All the known errors are enumerated in the `models/errors/errors.ts` module. The known errors for a method are documented under the *Errors* tables in SDK docs. For example, the `trigger` method may throw the following errors:

| Error Type                | Status Code                            | Content Type     |
| ------------------------- | -------------------------------------- | ---------------- |
| errors.ErrorDto           | 400, 401, 403, 404, 405, 409, 413, 415 | application/json |
| errors.ErrorDto           | 414                                    | application/json |
| errors.ValidationErrorDto | 422                                    | application/json |
| errors.ErrorDto           | 500                                    | application/json |
| errors.SDKError           | 4XX, 5XX                               | \*/\*            |

If the method throws an error and it is not captured by the known errors, it will default to throwing a `SDKError`.

```typescript
import { Novu } from "@novu/api";
import {
  ErrorDto,
  SDKValidationError,
  ValidationErrorDto,
} from "@novu/api/models/errors";

const novu = new Novu({
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  let result;
  try {
    result = await novu.trigger({
      name: "workflow_identifier",
      payload: {
        "comment_id": "string",
        "post": {
          "text": "string",
        },
      },
      bridgeUrl: "https://example.com/bridge",
      overrides: {
        "fcm": {
          "data": {
            "key": "value",
          },
        },
      },
      to: {
        subscriberId: "<id>",
      },
      actor: {
        subscriberId: "<id>",
      },
      tenant: {},
    });

    // Handle the result
    console.log(result);
  } catch (err) {
    switch (true) {
      // The server response does not match the expected SDK schema
      case (err instanceof SDKValidationError): {
        // Pretty-print will provide a human-readable multi-line error message
        console.error(err.pretty());
        // Raw value may also be inspected
        console.error(err.rawValue);
        return;
      }
      case (err instanceof ErrorDto): {
        // Handle err.data$: ErrorDtoData
        console.error(err);
        return;
      }
      case (err instanceof ErrorDto): {
        // Handle err.data$: ErrorDtoData
        console.error(err);
        return;
      }
      case (err instanceof ValidationErrorDto): {
        // Handle err.data$: ValidationErrorDtoData
        console.error(err);
        return;
      }
      case (err instanceof ErrorDto): {
        // Handle err.data$: ErrorDtoData
        console.error(err);
        return;
      }
      default: {
        // Other errors such as network errors, see HTTPClientErrors for more details
        throw err;
      }
    }
  }
}

run();

```

Validation errors can also occur when either method arguments or data returned from the server do not match the expected format. The `SDKValidationError` that is thrown as a result will capture the raw value that failed validation in an attribute called `rawValue`. Additionally, a `pretty()` method is available on this error that can be used to log a nicely formatted multi-line string since validation errors can list many issues and the plain error string may be difficult read when debugging.

In some rare cases, the SDK can fail to get a response from the server or even make the request due to unexpected circumstances such as network conditions. These types of errors are captured in the `models/errors/httpclienterrors.ts` module:

| HTTP Client Error                                    | Description                                          |
| ---------------------------------------------------- | ---------------------------------------------------- |
| RequestAbortedError                                  | HTTP request was aborted by the client               |
| RequestTimeoutError                                  | HTTP request timed out due to an AbortSignal signal  |
| ConnectionError                                      | HTTP client was unable to make a request to a server |
| InvalidRequestError                                  | Any input used to create a request is invalid        |
| UnexpectedClientError                                | Unrecognised or unexpected error                     |
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Select Server by Index

You can override the default server globally by passing a server index to the `serverIdx: number` optional parameter when initializing the SDK client instance. The selected server will then be used as the default on the operations that use it. This table lists the indexes associated with the available servers:

| #   | Server                   |
| --- | ------------------------ |
| 0   | `https://api.novu.co`    |
| 1   | `https://eu.api.novu.co` |

#### Example

```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  serverIdx: 1,
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  });

  // Handle the result
  console.log(result);
}

run();

```

### Override Server URL Per-Client

The default server can also be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { Novu } from "@novu/api";

const novu = new Novu({
  serverURL: "https://api.novu.co",
  security: {
    apiKey: "<YOUR_API_KEY_HERE>",
  },
});

async function run() {
  const result = await novu.trigger({
    name: "workflow_identifier",
    payload: {
      "comment_id": "string",
      "post": {
        "text": "string",
      },
    },
    bridgeUrl: "https://example.com/bridge",
    overrides: {
      "fcm": {
        "data": {
          "key": "value",
        },
      },
    },
    to: {
      subscriberId: "<id>",
    },
    actor: {
      subscriberId: "<id>",
    },
    tenant: {},
  });

  // Handle the result
  console.log(result);
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to to add a
custom header and a timeout to requests and how to use the `"requestError"` hook
to log errors:

```typescript
import { Novu } from "@novu/api";
import { HTTPClient } from "@novu/api/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new Novu({ httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { Novu } from "@novu/api";

const sdk = new Novu({ debugLogger: console });
```
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. 
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release. 

### SDK Created by [Speakeasy](https://www.speakeasy.com/?utm_source=@novu/api&utm_campaign=typescript)
