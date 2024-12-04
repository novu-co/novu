import { Injectable, Logger } from '@nestjs/common';
import {
  CommunityOrganizationRepository,
  MessageRepository,
  NotificationRepository,
  OrganizationRepository,
} from '@novu/dal';
import { InstrumentUsecase } from '@novu/application-generic';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';

import { UsageInsightsCommand } from './usage-insights.command';

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

  constructor(private organizationRepository: CommunityOrganizationRepository) {}

  private async readCacheFile(cacheFile: string) {
    try {
      const fileContent = await fs.readFile(cacheFile, 'utf-8');
      const cache = JSON.parse(fileContent);

      if (cache.timestamp && Date.now() - cache.timestamp < this.CACHE_TTL) {
        Logger.log(`Using cached Mixpanel data from ${cacheFile}`);

        return cache.data;
      }

      Logger.log('Cache expired, fetching fresh data');

      return null;
    } catch (error) {
      Logger.log('No cache file found or invalid cache');

      return null;
    }
  }

  private async writeCacheFile(data: any, cacheFile: string) {
    try {
      const cache = {
        timestamp: Date.now(),
        data,
      };

      await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));
      Logger.log(`Mixpanel data cached successfully to ${cacheFile}`);
    } catch (error) {
      Logger.error('Failed to cache Mixpanel data:', error);
    }
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number(((current - previous) / previous) * 100);
  }

  private async fetchMixpanelInsights(): Promise<IMixpanelResponse | null> {
    const cachedData = await this.readCacheFile(this.CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
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

      await this.writeCacheFile(response.data, this.CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Error fetching Mixpanel insights:', error);

      return null;
    }
  }

  private async fetchInboxInsights(): Promise<IInboxResponse | null> {
    const cachedData = await this.readCacheFile(this.INBOX_CACHE_FILE);
    if (cachedData) {
      return cachedData;
    }

    try {
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

      await this.writeCacheFile(response.data, this.INBOX_CACHE_FILE);

      return response.data;
    } catch (error) {
      Logger.error('Error fetching Inbox insights:', error?.response?.data || error);

      return null;
    }
  }

  private calculateInboxMetrics(inboxSeries: IInboxResponse['series'], orgId: string): IInboxMetrics {
    const getMetricStats = (seriesData: ISeriesData | undefined, orgKey: string): IMetricStats => {
      const data = seriesData?.[orgKey];
      if (!data) {
        return {
          current: 0,
          previous: 0,
          change: 0,
        };
      }

      const current = data['2024-12-02T00:00:00+02:00'] || 0;
      const previous = data['2024-11-25T00:00:00+02:00'] || 0;

      return {
        current,
        previous,
        change: this.calculateChange(current, previous),
      };
    };

    // Always return a complete metrics object
    return {
      sessionInitialized: getMetricStats(inboxSeries['A. Session Initialized - [Inbox] [Total Events]'], orgId),
      updatePreferences: getMetricStats(inboxSeries['B. Update Preferences - [Inbox] [Total Events]'], orgId),
      markNotification: getMetricStats(inboxSeries['C. Mark Notification As - [Inbox] [Total Events]'], orgId),
      updateAction: getMetricStats(inboxSeries['D. Update Notification Action - [Inbox] [Total Events]'], orgId),
    };
  }

  private calculateOverallInboxMetrics(inboxSeries: IInboxResponse['series']): IInboxMetrics {
    return this.calculateInboxMetrics(inboxSeries, '$overall');
  }

  private createOrganizationMetrics(
    orgId: string,
    subscriberSeries: ISeriesData,
    workflowSeries: ISeriesData
  ): IOrganizationMetrics {
    const orgMetrics: IOrganizationMetrics = {
      id: orgId,
      name: '',
      subscriberNotifications: {
        current: subscriberSeries[orgId]?.$overall?.['2024-12-02T00:00:00+02:00'] || 0,
        previous: subscriberSeries[orgId]?.$overall?.['2024-11-25T00:00:00+02:00'] || 0,
        change: 0,
      },
      channelBreakdown: {},
    };

    // Process channel breakdown from workflowSeries
    const orgWorkflowData = workflowSeries[orgId];
    if (orgWorkflowData) {
      Object.entries(orgWorkflowData).forEach(([channel, data]) => {
        if (channel !== '$overall') {
          orgMetrics.channelBreakdown[channel] = {
            current: data.$overall?.['2024-12-02T00:00:00+02:00'] || 0,
            previous: data.$overall?.['2024-11-25T00:00:00+02:00'] || 0,
            change: 0,
          };
        }
      });
    }

    return orgMetrics;
  }

  private async logOrganizationMetrics(metrics: ICombinedMetrics, workflowStats: IMixpanelResponse['workflowStats']) {
    try {
      const organization = await this.organizationRepository.findById(metrics.id);
      if (!organization) {
        Logger.warn(`Organization not found: ${metrics.id}`);

        return;
      }

      const enrichedMetrics = {
        ...metrics,
        name: organization.name,
        workflowStats: workflowStats.workflows,
      };

      Logger.log(`Organization Metrics: ${JSON.stringify(enrichedMetrics, null, 2)}`);
    } catch (error) {
      Logger.error(`Error logging organization metrics for ${metrics.id}:`, error);
    }
  }

  private calculateWorkflowStats(subscriberSeries: ISeriesData): IMixpanelResponse['workflowStats'] {
    const workflowStats: IMixpanelResponse['workflowStats'] = { workflows: {} };
    const currentPeriod = '2024-12-02T00:00:00+02:00';
    const previousPeriod = '2024-11-25T00:00:00+02:00';

    // Extract workflow names and stats from the first organization's subscriber events
    const firstOrgId = Object.keys(subscriberSeries).find((key) => key !== '$overall');
    if (!firstOrgId) return workflowStats;

    const orgData = subscriberSeries[firstOrgId]?.undefined;
    if (!orgData) return workflowStats;

    // Process each workflow from the subscriber events breakdown
    Object.entries(orgData)
      .filter(([name]) => name !== '$overall')
      .forEach(([name, data]) => {
        const current = data[currentPeriod] || 0;
        const previous = data[previousPeriod] || 0;

        workflowStats.workflows[name] = {
          current,
          previous,
          change: this.calculateChange(current, previous),
        };
      });

    return workflowStats;
  }

  @InstrumentUsecase()
  async execute(command: UsageInsightsCommand): Promise<IUsageInsightsResponse | null> {
    const [mixpanelData, inboxData] = await Promise.all([this.fetchMixpanelInsights(), this.fetchInboxInsights()]);

    if (!mixpanelData?.series) {
      Logger.error('No Mixpanel data available');

      return null;
    }

    const subscriberSeries = mixpanelData.series['A. Notification Subscriber Event Trigger [Total Events]'];
    const workflowSeries = mixpanelData.series['B. Process Workflow Step - [Triggers] [Total Events]'];

    if (!subscriberSeries || !workflowSeries) {
      Logger.error('Required series data not found');

      return null;
    }

    // Calculate workflow statistics
    const workflowStats = this.calculateWorkflowStats(subscriberSeries);
    mixpanelData.workflowStats = workflowStats;

    // Initialize inbox stats with default values
    const defaultInboxMetrics: IInboxMetrics = {
      sessionInitialized: { current: 0, previous: 0, change: 0 },
      updatePreferences: { current: 0, previous: 0, change: 0 },
      markNotification: { current: 0, previous: 0, change: 0 },
      updateAction: { current: 0, previous: 0, change: 0 },
    };

    const inboxStats: IUsageInsightsResponse['inboxStats'] = {
      byOrganization: {},
      overall: inboxData?.series ? this.calculateOverallInboxMetrics(inboxData.series) : defaultInboxMetrics,
    };

    // Process each organization's data
    for (const [orgId, orgData] of Object.entries(workflowSeries)) {
      if (orgId === '$overall') continue;

      const metrics = this.createOrganizationMetrics(orgId, subscriberSeries, workflowSeries) as ICombinedMetrics;

      // Calculate subscriber notifications change
      metrics.subscriberNotifications.change = this.calculateChange(
        metrics.subscriberNotifications.current,
        metrics.subscriberNotifications.previous
      );

      // Calculate channel breakdown changes
      metrics.channelBreakdown = Object.fromEntries(
        Object.entries(metrics.channelBreakdown).map(([channel, channelData]) => [
          channel,
          {
            ...channelData,
            change: this.calculateChange(channelData.current, channelData.previous),
          },
        ])
      );

      // Add inbox metrics if available
      if (inboxData?.series) {
        const inboxMetrics = this.calculateInboxMetrics(inboxData.series, orgId);
        metrics.inboxMetrics = inboxMetrics;
        inboxStats.byOrganization[orgId] = inboxMetrics;
      } else {
        metrics.inboxMetrics = defaultInboxMetrics;
        inboxStats.byOrganization[orgId] = defaultInboxMetrics;
      }

      await this.logOrganizationMetrics(metrics, workflowStats);
    }

    return {
      series: mixpanelData.series,
      workflowStats: mixpanelData.workflowStats,
      inboxStats,
    };
  }
}
