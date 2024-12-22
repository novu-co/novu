import { Injectable, Logger } from '@nestjs/common';
import { CommunityOrganizationRepository } from '@novu/dal';
import { InstrumentUsecase, FeatureFlagsService } from '@novu/application-generic';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';

import { usageInsightsWorkflow } from '@novu/notifications';
import { UsageInsightsCommand } from './usage-insights.command';

interface IDateRange {
  from_date: string;
  to_date: string;
}

const USE_INSIGHTS_CACHE = process.env.USE_INSIGHTS_CACHE === 'true';

interface IChannelMetrics {
  current: number;
  previous: number;
  change: number;
}

interface IOrganizationMetrics {
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
}

interface IMetricData {
  [date: string]: number;
}

interface IChannelData {
  [channel: string]: IMetricData;
  $overall: IMetricData;
}

type ISeriesData = {
  [organizationId: string]: IChannelData;
} & {
  $overall: IMetricData;
};

interface IMixpanelResponse {
  series: {
    'A. Notification Subscriber Event Trigger [Total Events]': ISeriesData;
    'B. Process Workflow Step - [Triggers] [Total Events]': ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      'A. Notification Subscriber Event Trigger [Total Events]': ISeriesData;
      'B. Process Workflow Step - [Triggers] [Total Events]': ISeriesData;
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

interface IInboxResponse {
  series: {
    'A. Session Initialized - [Inbox] [Total Events]': ISeriesData;
    'B. Update Preferences - [Inbox] [Total Events]': ISeriesData;
    'C. Mark Notification As - [Inbox] [Total Events]': ISeriesData;
    'D. Update Notification Action - [Inbox] [Total Events]': ISeriesData;
  };
  date_range: IDateRange;
  time_comparison: {
    date_range: IDateRange;
    series: {
      'A. Session Initialized - [Inbox] [Total Events]': ISeriesData;
      'B. Update Preferences - [Inbox] [Total Events]': ISeriesData;
      'C. Mark Notification As - [Inbox] [Total Events]': ISeriesData;
      'D. Update Notification Action - [Inbox] [Total Events]': ISeriesData;
    };
  };
}

interface IMetricStats {
  current: number;
  previous: number;
  change: number;
}

interface IInboxMetrics {
  sessionInitialized: IMetricStats;
  updatePreferences: IMetricStats;
  markNotification: IMetricStats;
  updateAction: IMetricStats;
}

interface IUsageInsightsResponse {
  series: IMixpanelResponse['series'];
  workflowStats: IMixpanelResponse['workflowStats'];
  inboxStats: {
    byOrganization: {
      [organizationId: string]: IInboxMetrics;
    };
    overall: IInboxMetrics;
  };
}

interface ICombinedMetrics extends IOrganizationMetrics {
  inboxMetrics?: IInboxMetrics;
}

@Injectable()
export class UsageInsights {
  private readonly CACHE_FILE = join(process.cwd(), 'mixpanel-insights-cache.json');
  private readonly INBOX_CACHE_FILE = join(process.cwd(), 'mixpanel-inbox-cache.json');
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    private organizationRepository: CommunityOrganizationRepository,
    private featureFlagsService: FeatureFlagsService
  ) {
    Logger.debug('UsageInsights service initialized');
  }

  private roundToStartOfDay(date: string): string {
    return `${new Date(date).toISOString().split('T')[0]}T00:00:00+02:00`;
  }

  private getSeriesDateRange(currentSeries: ISeriesData, previousSeries: ISeriesData): IDateRange {
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

  private async readCacheFile(cacheFile: string) {
    if (!USE_INSIGHTS_CACHE) {
      Logger.debug('Cache usage is disabled by environment variable');

      return null;
    }

    Logger.debug(`Attempting to read cache file: ${cacheFile}`);
    try {
      const fileContent = await fs.readFile(cacheFile, 'utf-8');
      const cache = JSON.parse(fileContent);

      if (cache.timestamp && Date.now() - cache.timestamp < this.CACHE_TTL) {
        Logger.debug(`Cache hit: Using data from ${cacheFile}, age: ${(Date.now() - cache.timestamp) / 1000}s`);

        return cache.data;
      }

      Logger.debug(`Cache expired for ${cacheFile}, age: ${(Date.now() - cache.timestamp) / 1000}s`);

      return null;
    } catch (error) {
      Logger.debug(`Cache miss: No valid cache found for ${cacheFile}`);

      return null;
    }
  }

  private async writeCacheFile(data: any, cacheFile: string) {
    if (!USE_INSIGHTS_CACHE) {
      Logger.debug('Cache usage is disabled by environment variable, skipping write');

      return;
    }

    Logger.debug(`Attempting to write cache file: ${cacheFile}`);
    try {
      const cache = {
        timestamp: Date.now(),
        data,
      };

      await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));
      Logger.debug(`Cache write successful: ${cacheFile}`);
    } catch (error) {
      Logger.error(`Cache write failed for ${cacheFile}:`, error);
    }
  }

  private calculateChange(current: number, previous: number): number {
    let change: number;

    if (previous === 0) {
      change = current > 0 ? 100 : 0;
    } else {
      change = Number(((current - previous) / previous) * 100);
    }

    Logger.debug(`Calculating change: current=${current}, previous=${previous}, change=${change}%`);

    return change;
  }

  private async fetchMixpanelInsights(): Promise<IMixpanelResponse | null> {
    Logger.debug('Fetching Mixpanel insights');
    const cachedData = await this.readCacheFile(this.CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
      Logger.debug('Making Mixpanel API request for insights');
      const response = await axios.get<IMixpanelResponse>('https://mixpanel.com/api/2.0/insights', {
        params: {
          project_id: '2667883',
          bookmark_id: '68515975',
        },
        headers: {
          Authorization: `Basic ${process.env.MIXPANEL_BASIC_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      Logger.debug('Mixpanel insights fetch successful');
      await this.writeCacheFile(response.data, this.CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Mixpanel insights fetch failed:', error);

      return null;
    }
  }

  private async fetchInboxInsights(): Promise<IInboxResponse | null> {
    Logger.debug('Fetching Inbox insights');
    const cachedData = await this.readCacheFile(this.INBOX_CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
      Logger.debug('Making Mixpanel API request for inbox insights');
      const response = await axios.get<IInboxResponse>('https://mixpanel.com/api/2.0/insights', {
        params: {
          project_id: '2667883',
          bookmark_id: '68521376',
        },
        headers: {
          Authorization: `Basic ${process.env.MIXPANEL_BASIC_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      Logger.debug('Inbox insights fetch successful');
      await this.writeCacheFile(response.data, this.INBOX_CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Inbox insights fetch failed:', error?.response?.data || error);

      return null;
    }
  }

  private calculateInboxMetrics(
    inboxSeries: IInboxResponse['series'],
    inboxTimeComparison: IInboxResponse['time_comparison']['series'],
    orgId: string,
    dateRange: IDateRange
  ): IInboxMetrics {
    Logger.debug(`Calculating inbox metrics for organization: ${orgId}`);
    const getMetricStats = (
      currentSeriesData: ISeriesData | undefined,
      previousSeriesData: ISeriesData | undefined,
      orgKey: string
    ): IMetricStats => {
      if (!currentSeriesData || !previousSeriesData) {
        Logger.debug(`No series data available for ${orgKey}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const currentData = currentSeriesData[orgKey];
      const previousData = previousSeriesData[orgKey];
      if (!currentData || !previousData) {
        Logger.debug(`No data available for ${orgKey}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const current = Number(Object.values(currentData)[0] || 0);
      const previous = Number(Object.values(previousData)[0] || 0);
      const change = this.calculateChange(current, previous);

      Logger.debug(`Metric stats for ${orgKey}: current=${current}, previous=${previous}, change=${change}%`);

      return { current, previous, change };
    };

    return {
      sessionInitialized: getMetricStats(
        inboxSeries['A. Session Initialized - [Inbox] [Total Events]'],
        inboxTimeComparison['A. Session Initialized - [Inbox] [Total Events]'],
        orgId
      ),
      updatePreferences: getMetricStats(
        inboxSeries['B. Update Preferences - [Inbox] [Total Events]'],
        inboxTimeComparison['B. Update Preferences - [Inbox] [Total Events]'],
        orgId
      ),
      markNotification: getMetricStats(
        inboxSeries['C. Mark Notification As - [Inbox] [Total Events]'],
        inboxTimeComparison['C. Mark Notification As - [Inbox] [Total Events]'],
        orgId
      ),
      updateAction: getMetricStats(
        inboxSeries['D. Update Notification Action - [Inbox] [Total Events]'],
        inboxTimeComparison['D. Update Notification Action - [Inbox] [Total Events]'],
        orgId
      ),
    };
  }

  private calculateOverallInboxMetrics(
    inboxSeries: IInboxResponse['series'],
    inboxTimeComparison: IInboxResponse['time_comparison']['series']
  ): IInboxMetrics {
    Logger.debug('Calculating overall inbox metrics');

    const getMetricStats = (
      currentSeriesData: ISeriesData | undefined,
      previousSeriesData: ISeriesData | undefined
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
        inboxSeries['A. Session Initialized - [Inbox] [Total Events]'],
        inboxTimeComparison['A. Session Initialized - [Inbox] [Total Events]']
      ),
      updatePreferences: getMetricStats(
        inboxSeries['B. Update Preferences - [Inbox] [Total Events]'],
        inboxTimeComparison['B. Update Preferences - [Inbox] [Total Events]']
      ),
      markNotification: getMetricStats(
        inboxSeries['C. Mark Notification As - [Inbox] [Total Events]'],
        inboxTimeComparison['C. Mark Notification As - [Inbox] [Total Events]']
      ),
      updateAction: getMetricStats(
        inboxSeries['D. Update Notification Action - [Inbox] [Total Events]'],
        inboxTimeComparison['D. Update Notification Action - [Inbox] [Total Events]']
      ),
    };
  }

  private createOrganizationMetrics(
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

  private calculateWorkflowStats(
    subscriberSeries: ISeriesData,
    subscriberTimeComparison: ISeriesData
  ): IMixpanelResponse['workflowStats'] {
    Logger.debug('Calculating workflow statistics');
    const workflowStats: IMixpanelResponse['workflowStats'] = { workflows: {} };

    const firstOrgId = Object.keys(subscriberSeries).find((key) => key !== '$overall');
    if (!firstOrgId) {
      Logger.debug('No organization data found for workflow stats');

      return workflowStats;
    }

    const orgData = subscriberSeries[firstOrgId]?.undefined;
    const orgPreviousData = subscriberTimeComparison[firstOrgId]?.undefined;
    if (!orgData || !orgPreviousData) {
      Logger.debug(`No workflow data found for organization: ${firstOrgId}`);

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

  private async sendOrganizationNotification(
    metrics: ICombinedMetrics,
    workflowStats: IMixpanelResponse['workflowStats'],
    dateRange: IDateRange
  ) {
    Logger.debug(`Processing metrics for organization: ${metrics.id}`);
    try {
      const organization = await this.organizationRepository.findById(metrics.id);
      if (!organization) {
        Logger.warn(`Organization not found in repository: ${metrics.id}`);

        return;
      }

      const enrichedMetrics = {
        ...metrics,
        name: organization.name,
        workflowStats: workflowStats.workflows,
      };

      Logger.debug(`Enriched metrics for ${organization.name}:`, enrichedMetrics);

      const isEnabled = await this.featureFlagsService.get(FeatureFlagsKeysEnum.IS_USAGE_INSIGHTS_ENABLED, false, {
        environmentId: 'system',
        organizationId: organization._id,
        userId: 'system',
      });

      if (!isEnabled) {
        Logger.log('Skipping notification delivery - usage insights disabled by feature flag', enrichedMetrics);

        return;
      }

      await usageInsightsWorkflow.trigger({
        to: {
          subscriberId: '675fe9bcab6a05bb6dcb7dab_11',
          email: `dima+testing-${organization._id}@novu.co`,
        },
        payload: {
          period: {
            current: dateRange.to_date,
            previous: dateRange.from_date,
          },
          subscriberNotifications: metrics.subscriberNotifications,
          channelBreakdown: {
            email: metrics.channelBreakdown.email || { current: 0, previous: 0, change: 0 },
            sms: metrics.channelBreakdown.sms || { current: 0, previous: 0, change: 0 },
            push: metrics.channelBreakdown.push || { current: 0, previous: 0, change: 0 },
          },
          inboxMetrics: {
            sessionInitialized: metrics.inboxMetrics?.sessionInitialized,
            updatePreferences: metrics.inboxMetrics?.updatePreferences,
            markNotification: metrics.inboxMetrics?.markNotification,
            updateAction: metrics.inboxMetrics?.updateAction,
          },
          workflowStats: workflowStats.workflows,
        },
        secretKey: process.env.NOVU_INTERNAL_SECRET_KEY,
      });
    } catch (error) {
      Logger.error(`Failed to process metrics for organization ${metrics.id}:`, error);
    }
  }

  @InstrumentUsecase()
  async execute(command: UsageInsightsCommand): Promise<IUsageInsightsResponse | null> {
    Logger.debug('Executing UsageInsights usecase', { command });

    const [mixpanelData, inboxData] = await Promise.all([this.fetchMixpanelInsights(), this.fetchInboxInsights()]);

    if (!mixpanelData?.series) {
      Logger.error('Mixpanel data unavailable or invalid');

      return null;
    }

    Logger.debug('Processing Mixpanel and Inbox data');
    const subscriberSeries = mixpanelData.series['A. Notification Subscriber Event Trigger [Total Events]'];
    const workflowSeries = mixpanelData.series['B. Process Workflow Step - [Triggers] [Total Events]'];
    const subscriberTimeComparison =
      mixpanelData.time_comparison.series['A. Notification Subscriber Event Trigger [Total Events]'];
    const workflowTimeComparison =
      mixpanelData.time_comparison.series['B. Process Workflow Step - [Triggers] [Total Events]'];

    if (!subscriberSeries || !workflowSeries || !subscriberTimeComparison || !workflowTimeComparison) {
      Logger.error('Required series data missing from Mixpanel response');

      return null;
    }

    const seriesDateRange = {
      from_date: mixpanelData.time_comparison.date_range.from_date,
      to_date: mixpanelData.date_range.to_date,
    };

    const workflowStats = this.calculateWorkflowStats(subscriberSeries, subscriberTimeComparison);
    mixpanelData.workflowStats = workflowStats;

    const defaultInboxMetrics: IInboxMetrics = {
      sessionInitialized: { current: 0, previous: 0, change: 0 },
      updatePreferences: { current: 0, previous: 0, change: 0 },
      markNotification: { current: 0, previous: 0, change: 0 },
      updateAction: { current: 0, previous: 0, change: 0 },
    };

    Logger.debug('Initializing inbox stats');
    const inboxStats: IUsageInsightsResponse['inboxStats'] = {
      byOrganization: {},
      overall: inboxData?.series
        ? this.calculateOverallInboxMetrics(inboxData.series, inboxData.time_comparison.series)
        : defaultInboxMetrics,
    };

    Logger.debug('Processing organization data');
    for (const [orgId, orgData] of Object.entries(workflowSeries)) {
      if (orgId === '$overall') continue;

      Logger.debug(`Processing metrics for organization: ${orgId}`);
      const metrics = this.createOrganizationMetrics(
        orgId,
        subscriberSeries,
        subscriberTimeComparison,
        workflowSeries,
        workflowTimeComparison
      ) as ICombinedMetrics;

      metrics.subscriberNotifications.change = this.calculateChange(
        metrics.subscriberNotifications.current,
        metrics.subscriberNotifications.previous
      );

      metrics.channelBreakdown = Object.fromEntries(
        Object.entries(metrics.channelBreakdown).map(([channel, channelData]) => [
          channel,
          {
            ...channelData,
            change: this.calculateChange(channelData.current, channelData.previous),
          },
        ])
      );

      if (inboxData?.series) {
        Logger.debug(`Adding inbox metrics for organization: ${orgId}`);
        const inboxMetrics = this.calculateInboxMetrics(
          inboxData.series,
          inboxData.time_comparison.series,
          orgId,
          seriesDateRange
        );
        metrics.inboxMetrics = inboxMetrics;
        inboxStats.byOrganization[orgId] = inboxMetrics;
      } else {
        Logger.debug(`Using default inbox metrics for organization: ${orgId}`);
        metrics.inboxMetrics = defaultInboxMetrics;
        inboxStats.byOrganization[orgId] = defaultInboxMetrics;
      }

      await this.sendOrganizationNotification(metrics, workflowStats, seriesDateRange);
    }

    Logger.debug('UsageInsights execution completed successfully');

    return {
      series: mixpanelData.series,
      workflowStats: mixpanelData.workflowStats,
      inboxStats,
    };
  }
}
