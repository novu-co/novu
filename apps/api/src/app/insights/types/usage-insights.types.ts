export enum MixpanelSeriesNameEnum {
  NOTIFICATION_SUBSCRIBER_EVENT = 'A. Notification Subscriber Event Trigger [Total Events]',
  PROCESS_WORKFLOW_STEP = 'B. Process Workflow Step - [Triggers] [Total Events]',
  INBOX_SESSION_INITIALIZED = 'A. Session Initialized - [Inbox] [Total Events]',
  INBOX_UPDATE_PREFERENCES = 'B. Update Preferences - [Inbox] [Total Events]',
  INBOX_MARK_NOTIFICATION = 'C. Mark Notification As - [Inbox] [Total Events]',
  INBOX_UPDATE_ACTION = 'D. Update Notification Action - [Inbox] [Total Events]',
}

export interface IDateRange {
  from_date: string;
  to_date: string;
}

export interface IChannelMetrics {
  current: number;
  previous: number;
  change: number;
}

export interface IOrganizationMetrics {
  readonly id: string;
  readonly name: string;
  subscriberNotifications: {
    current: number;
    previous: number;
    change: number;
  };
  channelBreakdown: {
    [channel: string]: IChannelMetrics;
  };
  inboxMetrics?: IInboxMetrics;
}

export interface IMetricData {
  [date: string]: number;
}

export interface IChannelData {
  [channel: string]: IMetricData;
  $overall: IMetricData;
}

export type ISeriesData = {
  [organizationId: string]: IChannelData;
} & {
  $overall: IMetricData;
};

export interface IMixpanelResponse {
  series: {
    [MixpanelSeriesNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]: ISeriesData;
    [MixpanelSeriesNameEnum.PROCESS_WORKFLOW_STEP]: ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      [MixpanelSeriesNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]: ISeriesData;
      [MixpanelSeriesNameEnum.PROCESS_WORKFLOW_STEP]: ISeriesData;
    };
  };
  workflowStats: {
    workflows: {
      [name: string]: {
        current: number;
        previous: number;
        change: number;
      };
    };
  };
}

export interface IInboxResponse {
  series: {
    [MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED]: ISeriesData;
    [MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: ISeriesData;
    [MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION]: ISeriesData;
    [MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION]: ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      [MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED]: ISeriesData;
      [MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: ISeriesData;
      [MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION]: ISeriesData;
      [MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION]: ISeriesData;
    };
  };
}

export interface IMetricStats {
  current: number;
  previous: number;
  change: number;
}

export interface IInboxMetrics {
  sessionInitialized: IMetricStats;
  updatePreferences: IMetricStats;
  markNotification: IMetricStats;
  updateAction: IMetricStats;
}

export interface IUsageInsightsResponse {
  series: IMixpanelResponse['series'];
  workflowStats: IMixpanelResponse['workflowStats'];
  inboxStats: {
    byOrganization: {
      [organizationId: string]: IInboxMetrics;
    };
    overall: IInboxMetrics;
  };
}

export interface ICombinedMetrics extends IOrganizationMetrics {
  inboxMetrics?: IInboxMetrics;
}
