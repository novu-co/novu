import { Injectable, Logger } from '@nestjs/common';
import { CommunityOrganizationRepository } from '@novu/dal';
import { InstrumentUsecase } from '@novu/application-generic';
import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';

import { usageInsightsWorkflow } from '@novu/notifications';
import { UsageInsightsCommand } from './usage-insights.command';

const CURRENT_PERIOD = '2024-12-16T00:00:00+02:00';
const PREVIOUS_PERIOD = '2024-12-09T00:00:00+02:00';
const WORKFLOW_CURRENT_PERIOD = '2024-12-16T00:00:00+02:00';
const WORKFLOW_PREVIOUS_PERIOD = '2024-12-09T00:00:00+02:00';

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

  constructor(private organizationRepository: CommunityOrganizationRepository) {
    Logger.debug('UsageInsights service initialized');
  }

  private async readCacheFile(cacheFile: string) {
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

  private calculateInboxMetrics(inboxSeries: IInboxResponse['series'], orgId: string): IInboxMetrics {
    Logger.debug(`Calculating inbox metrics for organization: ${orgId}`);
    const getMetricStats = (seriesData: ISeriesData | undefined, orgKey: string): IMetricStats => {
      if (!seriesData) {
        Logger.debug(`No series data available for ${orgKey}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const data = seriesData[orgKey];
      if (!data) {
        Logger.debug(`No data available for ${orgKey}`);

        return { current: 0, previous: 0, change: 0 };
      }

      const current = Number(data[CURRENT_PERIOD] || 0);
      const previous = Number(data[PREVIOUS_PERIOD] || 0);
      const change = this.calculateChange(current, previous);

      Logger.debug(`Metric stats for ${orgKey}: current=${current}, previous=${previous}, change=${change}%`);

      return { current, previous, change };
    };

    const metrics = {
      sessionInitialized: getMetricStats(inboxSeries['A. Session Initialized - [Inbox] [Total Events]'], orgId),
      updatePreferences: getMetricStats(inboxSeries['B. Update Preferences - [Inbox] [Total Events]'], orgId),
      markNotification: getMetricStats(inboxSeries['C. Mark Notification As - [Inbox] [Total Events]'], orgId),
      updateAction: getMetricStats(inboxSeries['D. Update Notification Action - [Inbox] [Total Events]'], orgId),
    };

    Logger.debug(`Inbox metrics calculated for ${orgId}:`, metrics);

    return metrics;
  }

  private calculateOverallInboxMetrics(inboxSeries: IInboxResponse['series']): IInboxMetrics {
    Logger.debug('Calculating overall inbox metrics');

    return this.calculateInboxMetrics(inboxSeries, '$overall');
  }

  private createOrganizationMetrics(
    orgId: string,
    subscriberSeries: ISeriesData,
    workflowSeries: ISeriesData
  ): IOrganizationMetrics {
    Logger.debug(`Creating organization metrics for: ${orgId}`);

    const orgMetrics: IOrganizationMetrics = {
      id: orgId,
      name: '',
      subscriberNotifications: {
        current: subscriberSeries[orgId]?.$overall?.[WORKFLOW_CURRENT_PERIOD] || 0,
        previous: subscriberSeries[orgId]?.$overall?.[WORKFLOW_PREVIOUS_PERIOD] || 0,
        change: 0,
      },
      channelBreakdown: {},
    };

    Logger.debug(`Subscriber notifications for ${orgId}:`, orgMetrics.subscriberNotifications);

    const orgWorkflowData = workflowSeries[orgId];
    if (orgWorkflowData) {
      Object.entries(orgWorkflowData).forEach(([channel, data]) => {
        if (channel !== '$overall') {
          const current = data.$overall?.[WORKFLOW_CURRENT_PERIOD] || 0;
          const previous = data.$overall?.[WORKFLOW_PREVIOUS_PERIOD] || 0;

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

  private async logOrganizationMetrics(metrics: ICombinedMetrics, workflowStats: IMixpanelResponse['workflowStats']) {
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

      await usageInsightsWorkflow.trigger({
        to: {
          subscriberId: '675fe9bcab6a05bb6dcb7dab_11',
          email: 'dima@novu.co',
        },
        payload: {
          period: {
            current: CURRENT_PERIOD,
            previous: PREVIOUS_PERIOD,
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

  private calculateWorkflowStats(subscriberSeries: ISeriesData): IMixpanelResponse['workflowStats'] {
    Logger.debug('Calculating workflow statistics');
    const workflowStats: IMixpanelResponse['workflowStats'] = { workflows: {} };

    const firstOrgId = Object.keys(subscriberSeries).find((key) => key !== '$overall');
    if (!firstOrgId) {
      Logger.debug('No organization data found for workflow stats');

      return workflowStats;
    }

    const orgData = subscriberSeries[firstOrgId]?.undefined;
    if (!orgData) {
      Logger.debug(`No workflow data found for organization: ${firstOrgId}`);

      return workflowStats;
    }

    Object.entries(orgData)
      .filter(([name]) => name !== '$overall')
      .forEach(([name, data]) => {
        const current = data[WORKFLOW_CURRENT_PERIOD] || 0;
        const previous = data[WORKFLOW_PREVIOUS_PERIOD] || 0;
        const change = this.calculateChange(current, previous);

        workflowStats.workflows[name] = { current, previous, change };
        Logger.debug(`Workflow stats for ${name}: current=${current}, previous=${previous}, change=${change}%`);
      });

    return workflowStats;
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

    if (!subscriberSeries || !workflowSeries) {
      Logger.error('Required series data missing from Mixpanel response');

      return null;
    }

    const workflowStats = this.calculateWorkflowStats(subscriberSeries);
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
      overall: inboxData?.series ? this.calculateOverallInboxMetrics(inboxData.series) : defaultInboxMetrics,
    };

    Logger.debug('Processing organization data');
    for (const [orgId, orgData] of Object.entries(workflowSeries)) {
      if (orgId === '$overall') continue;

      Logger.debug(`Processing metrics for organization: ${orgId}`);
      const metrics = this.createOrganizationMetrics(orgId, subscriberSeries, workflowSeries) as ICombinedMetrics;

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
        const inboxMetrics = this.calculateInboxMetrics(inboxData.series, orgId);
        metrics.inboxMetrics = inboxMetrics;
        inboxStats.byOrganization[orgId] = inboxMetrics;
      } else {
        Logger.debug(`Using default inbox metrics for organization: ${orgId}`);
        metrics.inboxMetrics = defaultInboxMetrics;
        inboxStats.byOrganization[orgId] = defaultInboxMetrics;
      }

      await this.logOrganizationMetrics(metrics, workflowStats);
    }

    Logger.debug('UsageInsights execution completed successfully');

    return {
      series: mixpanelData.series,
      workflowStats: mixpanelData.workflowStats,
      inboxStats,
    };
  }
}
