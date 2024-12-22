import { Injectable, Logger } from '@nestjs/common';
import { startOfDay, formatISO } from 'date-fns';
import {
  IDateRange,
  ISeriesData,
  IInboxResponse,
  IInboxMetrics,
  IOrganizationMetrics,
  IMixpanelResponse,
  IMetricStats,
  MixpanelSeriesNameEnum,
  IChannelData,
} from '../types/usage-insights.types';

@Injectable()
export class MetricsCalculatorService {
  private roundToStartOfDay(date: string): string {
    return formatISO(startOfDay(new Date(date)));
  }

  calculateChange(current: number, previous: number): number {
    let change: number;

    if (previous === 0) {
      change = current > 0 ? 100 : 0;
    } else {
      change = Number(((current - previous) / previous) * 100);
    }

    Logger.debug(`Calculating change: current=${current}, previous=${previous}, change=${change}%`);

    return change;
  }

  getSeriesDateRange(currentSeries: ISeriesData, previousSeries: ISeriesData): IDateRange {
    const firstOrgId = Object.keys(currentSeries).find((key) => key !== '$overall');
    if (!firstOrgId) {
      return { from_date: '', to_date: '' };
    }

    const currentDates = Object.keys(currentSeries[firstOrgId]?.$overall || {});
    const previousDates = Object.keys(previousSeries[firstOrgId]?.$overall || {});

    if (!currentDates.length || !previousDates.length) {
      return { from_date: '', to_date: '' };
    }

    return {
      from_date: this.roundToStartOfDay(previousDates[0]),
      to_date: this.roundToStartOfDay(currentDates[0]),
    };
  }

  calculateInboxMetrics(
    inboxSeries: IInboxResponse['series'],
    inboxTimeComparison: IInboxResponse['time_comparison']['series'],
    orgId: string,
    dateRange: IDateRange
  ): IInboxMetrics {
    Logger.debug(`Calculating inbox metrics for organization: ${orgId}`);
    const getMetricStats = (
      currentSeriesData: ISeriesData | undefined,
      previousSeriesData: ISeriesData | undefined
    ): IMetricStats => {
      if (!currentSeriesData || !previousSeriesData) {
        Logger.debug(`No series data available for ${orgId}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const currentOrgData = currentSeriesData[orgId];
      const previousOrgData = previousSeriesData[orgId];

      if (!currentOrgData || !previousOrgData) {
        Logger.debug(`No series data available for ${orgId}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const currentData = currentOrgData[this.roundToStartOfDay(dateRange.to_date)];
      const previousData = previousOrgData[this.roundToStartOfDay(dateRange.from_date)];

      console.log(currentOrgData, 'HIII', this.roundToStartOfDay(dateRange.to_date));
      console.log(previousOrgData, 'HIII', this.roundToStartOfDay(dateRange.from_date));

      if (!currentData || !previousData) {
        Logger.debug(`No data available for ${orgId}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const current = Number(currentData || 0);
      const previous = Number(previousData || 0);
      const change = this.calculateChange(current, previous);

      Logger.debug(`Metric stats for ${orgId}: current=${current}, previous=${previous}, change=${change}%`);

      return { current, previous, change };
    };

    return {
      sessionInitialized: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED]
      ),
      updatePreferences: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES]
      ),
      markNotification: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION]
      ),
      updateAction: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION]
      ),
    };
  }

  calculateOverallInboxMetrics(
    orgId: string,
    inboxSeries: IInboxResponse['series'],
    inboxTimeComparison: IInboxResponse['time_comparison']['series']
  ): IInboxMetrics {
    Logger.debug('Calculating overall inbox metrics');

    const getMetricStats = (
      currentSeriesData: IChannelData | undefined,
      previousSeriesData: IChannelData | undefined
    ): IMetricStats => {
      if (!currentSeriesData?.$overall || !previousSeriesData?.$overall) {
        return { current: 0, previous: 0, change: 0 };
      }

      const current = Number(Object.values(currentSeriesData.$overall)[0] || 0);
      const previous = Number(Object.values(previousSeriesData.$overall)[0] || 0);
      const change = this.calculateChange(current, previous);

      return { current, previous, change };
    };

    return {
      sessionInitialized: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED][orgId],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_SESSION_INITIALIZED][orgId]
      ),
      updatePreferences: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES][orgId],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_UPDATE_PREFERENCES][orgId]
      ),
      markNotification: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION][orgId],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_MARK_NOTIFICATION][orgId]
      ),
      updateAction: getMetricStats(
        inboxSeries[MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION][orgId],
        inboxTimeComparison[MixpanelSeriesNameEnum.INBOX_UPDATE_ACTION][orgId]
      ),
    };
  }

  createOrganizationMetrics(
    orgId: string,
    subscriberSeries: ISeriesData,
    subscriberTimeComparison: ISeriesData,
    workflowSeries: ISeriesData,
    workflowTimeComparison: ISeriesData
  ): IOrganizationMetrics {
    Logger.debug(`Creating organization metrics for: ${orgId}`);

    const orgMetrics: IOrganizationMetrics = {
      id: orgId,
      name: '',
      subscriberNotifications: {
        current: Number(Object.values(subscriberSeries[orgId]?.$overall || {})[0] || 0),
        previous: Number(Object.values(subscriberTimeComparison[orgId]?.$overall || {})[0] || 0),
        change: 0,
      },
      channelBreakdown: {},
    };

    Logger.debug(`Subscriber notifications for ${orgId}:`, orgMetrics.subscriberNotifications);

    const orgWorkflowData = workflowSeries[orgId];
    const orgWorkflowPreviousData = workflowTimeComparison[orgId];
    if (orgWorkflowData && orgWorkflowPreviousData) {
      Object.entries(orgWorkflowData).forEach(([channel, data]) => {
        if (channel !== '$overall') {
          const current = Number(Object.values(data.$overall || {})[0] || 0);
          const previous = Number(Object.values(orgWorkflowPreviousData[channel]?.$overall || {})[0] || 0);

          orgMetrics.channelBreakdown[channel] = {
            current,
            previous,
            change: 0,
          };

          Logger.debug(`Channel metrics for ${orgId}/${channel}: current=${current}, previous=${previous}`);
        }
      });
    } else {
      Logger.debug(`No workflow data available for organization: ${orgId}`);
    }

    return orgMetrics;
  }

  calculateWorkflowStats(
    orgId: string,
    subscriberSeries: ISeriesData,
    subscriberTimeComparison: ISeriesData
  ): IMixpanelResponse['workflowStats'] {
    Logger.debug('Calculating workflow statistics');
    const workflowStats: IMixpanelResponse['workflowStats'] = { workflows: {} };

    const orgData = subscriberSeries[orgId]?.undefined;
    const orgPreviousData = subscriberTimeComparison[orgId]?.undefined;
    if (!orgData || !orgPreviousData) {
      Logger.debug(`No workflow data found for organization: ${orgId}`);

      return workflowStats;
    }

    Object.entries(orgData)
      .filter(([name]) => name !== '$overall')
      .forEach(([name, data]) => {
        const current = Number(Object.values(data)[0] || 0);
        const previous = Number(Object.values(orgPreviousData[name] || {})[0] || 0);
        const change = this.calculateChange(current, previous);

        workflowStats.workflows[name] = { current, previous, change };
        Logger.debug(`Workflow stats for ${name}: current=${current}, previous=${previous}, change=${change}%`);
      });

    return workflowStats;
  }
}
