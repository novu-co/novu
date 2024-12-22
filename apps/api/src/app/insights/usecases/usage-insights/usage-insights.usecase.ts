import { Injectable, Logger } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';

import { IUsageInsightsResponse, IInboxMetrics } from './types/usage-insights.types';
import { MixpanelService } from '../../services/mixpanel.service';
import { MetricsCalculatorService } from '../../services/metrics-calculator.service';
import { OrganizationNotificationService } from '../../services/organization-notification.service';
import { UsageInsightsCommand } from './usage-insights.command';

@Injectable()
export class UsageInsights {
  constructor(
    private mixpanelService: MixpanelService,
    private metricsCalculator: MetricsCalculatorService,
    private organizationNotification: OrganizationNotificationService
  ) {
    Logger.debug('UsageInsights service initialized');
  }

  @InstrumentUsecase()
  async execute(command: UsageInsightsCommand): Promise<IUsageInsightsResponse | null> {
    Logger.debug('Executing UsageInsights usecase', { command });

    const [mixpanelData, inboxData] = await Promise.all([
      this.mixpanelService.fetchMixpanelInsights(),
      this.mixpanelService.fetchInboxInsights(),
    ]);

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

    Logger.debug('Processing organization data');
    for (const [orgId, orgData] of Object.entries(workflowSeries)) {
      if (orgId === '$overall') continue;

      const workflowStats = this.metricsCalculator.calculateWorkflowStats(
        orgId,
        subscriberSeries,
        subscriberTimeComparison
      );
      mixpanelData.workflowStats = workflowStats;

      const defaultInboxMetrics: IInboxMetrics = {
        sessionInitialized: { current: 0, previous: 0, change: 0 },
        updatePreferences: { current: 0, previous: 0, change: 0 },
        markNotification: { current: 0, previous: 0, change: 0 },
        updateAction: { current: 0, previous: 0, change: 0 },
      };

      Logger.debug('Initializing inbox stats');
      Logger.debug(`Processing metrics for organization: ${orgId}`);
      const metrics = this.metricsCalculator.createOrganizationMetrics(
        orgId,
        subscriberSeries,
        subscriberTimeComparison,
        workflowSeries,
        workflowTimeComparison
      );

      metrics.subscriberNotifications.change = this.metricsCalculator.calculateChange(
        metrics.subscriberNotifications.current,
        metrics.subscriberNotifications.previous
      );

      metrics.channelBreakdown = Object.fromEntries(
        Object.entries(metrics.channelBreakdown).map(([channel, channelData]) => [
          channel,
          {
            ...channelData,
            change: this.metricsCalculator.calculateChange(channelData.current, channelData.previous),
          },
        ])
      );

      if (inboxData?.series) {
        Logger.debug(`Adding inbox metrics for organization: ${orgId}`);
        const inboxMetrics = this.metricsCalculator.calculateInboxMetrics(
          inboxData.series,
          inboxData.time_comparison.series,
          orgId,
          {
            from_date: inboxData.time_comparison.date_range.from_date,
            to_date: inboxData.date_range.from_date,
          }
        );
        metrics.inboxMetrics = inboxMetrics;
      } else {
        Logger.debug(`Using default inbox metrics for organization: ${orgId}`);
        metrics.inboxMetrics = defaultInboxMetrics;
      }

      await this.organizationNotification.sendOrganizationNotification(metrics, workflowStats, {
        from_date: mixpanelData.time_comparison.date_range.from_date,
        to_date: mixpanelData.date_range.to_date,
      });
    }

    Logger.debug('UsageInsights execution completed successfully');
  }
}
