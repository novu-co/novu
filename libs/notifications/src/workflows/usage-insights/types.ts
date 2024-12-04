export interface IChannelMetrics {
  current: number;
  previous: number;
  change: number;
}

export interface IInboxMetrics {
  sessionInitialized: IChannelMetrics;
  updatePreferences: IChannelMetrics;
  markNotification: IChannelMetrics;
  updateAction: IChannelMetrics;
}

export interface IWorkflowMetric {
  current: number;
  previous: number;
  change: number;
}

export interface IUsageEmailData {
  organizationName: string;
  period: {
    current: string;
    previous: string;
  };
  subscriberNotifications: IChannelMetrics;
  channelBreakdown: {
    [channel: string]: IChannelMetrics;
  };
  inboxMetrics: IInboxMetrics;
  workflowStats: {
    [name: string]: IWorkflowMetric;
  };
}
