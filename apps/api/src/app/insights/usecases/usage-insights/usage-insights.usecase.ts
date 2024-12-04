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
        current: {
          total: number;
          period: string;
        };
        previous: {
          total: number;
          period: string;
        };
        change: number;
      };
    };
  };
}

@Injectable()
export class UsageInsights {
  private readonly CACHE_FILE = join(process.cwd(), 'mixpanel-insights-cache.json');
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(private organizationRepository: CommunityOrganizationRepository) {}

  private async readCacheFile() {
    try {
      const fileContent = await fs.readFile(this.CACHE_FILE, 'utf-8');
      const cache = JSON.parse(fileContent);

      if (cache.timestamp && Date.now() - cache.timestamp < this.CACHE_TTL) {
        Logger.log('Using cached Mixpanel insights data');

        return cache.data as IMixpanelResponse;
      }

      Logger.log('Cache expired, fetching fresh data');

      return null;
    } catch (error) {
      Logger.log('No cache file found or invalid cache');

      return null;
    }
  }

  private async writeCacheFile(data: IMixpanelResponse) {
    try {
      const cache = {
        timestamp: Date.now(),
        data,
      };

      await fs.writeFile(this.CACHE_FILE, JSON.stringify(cache, null, 2));
      Logger.log('Mixpanel insights data cached successfully');
    } catch (error) {
      Logger.error('Failed to cache Mixpanel insights data:', error);
    }
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Number(((current - previous) / previous) * 100);
  }

  private async fetchMixpanelInsights() {
    const cachedData = await this.readCacheFile();
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log(process.env.MIXPANEL_BASIC_AUTH_TOKEN);
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

      await this.writeCacheFile(response.data);

      return response.data;
    } catch (error) {
      Logger.log('a', error.response.data);
      Logger.error('Error fetching Mixpanel insights:', error);

      return null;
    }
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

  private async logOrganizationMetrics(
    metrics: IOrganizationMetrics,
    workflowStats: IMixpanelResponse['workflowStats']
  ) {
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
  async execute(command: UsageInsightsCommand): Promise<any> {
    const mixpanelData = await this.fetchMixpanelInsights();

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

    // Process each organization's data
    for (const [orgId, orgData] of Object.entries(workflowSeries)) {
      if (orgId === '$overall') continue;

      const metrics = this.createOrganizationMetrics(orgId, subscriberSeries, workflowSeries);

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

      await this.logOrganizationMetrics(metrics, workflowStats);
    }

    return mixpanelData;
  }
}
