import { Injectable, Logger } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';

import {
  IChannelData,
  IMixpanelInboxResponse,
  IMixpanelTriggerResponse,
  IOrganizationMetrics,
  MixpanelInboxSeriesNameEnum,
  MixpanelTriggerEventNameEnum,
} from '../../types/usage-insights.types';
import { MixpanelService } from '../../services/mixpanel.service';
import { MetricsCalculatorService } from '../../services/metrics-calculator.service';
import { OrganizationNotificationService } from '../../services/organization-notification.service';
import { UsageInsightsCommand } from './usage-insights.command';

interface IOrganizationData {
  workflowTrigger: {
    current: IChannelData;
    previous: IChannelData;
  };
  stepProcessing: {
    current: IChannelData;
    previous: IChannelData;
  };
  inbox?: {
    current: Record<MixpanelInboxSeriesNameEnum, IChannelData>;
    previous: Record<MixpanelInboxSeriesNameEnum, IChannelData>;
  };
}

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
  async execute(command: UsageInsightsCommand): Promise<void> {
    Logger.debug('Executing UsageInsights usecase', { command });

    const [mixpanelData, inboxData] = await Promise.all([
      this.mixpanelService.fetchMixpanelInsights(),
      this.mixpanelService.fetchInboxInsights(),
    ]);

    if (!mixpanelData?.series || !inboxData?.series) {
      Logger.error('Mixpanel data unavailable or invalid');

      return;
    }

    Logger.debug('Processing organization data');

    if (command.organizationId) {
      await this.processOrganization(command.organizationId, mixpanelData, inboxData);
    } else {
      let counter = 0;
      for (const [orgId, orgData] of Object.entries(
        mixpanelData.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT]
      )) {
        if (orgId === '$overall') continue;

        counter += 1;
        if (counter > 5) break;

        await this.processOrganization(orgId, mixpanelData, inboxData);
      }
    }

    Logger.debug('Usage Insights execution completed successfully');
  }

  private async processOrganization(
    orgId: string,
    mixpanelData: IMixpanelTriggerResponse,
    inboxData: IMixpanelInboxResponse
  ) {
    Logger.debug('Processing Mixpanel and Inbox data');
    // Trigger Workflow data
    const triggerEventSeries = mixpanelData.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT];
    const triggerEventPreviousSeries =
      mixpanelData.time_comparison.series[MixpanelTriggerEventNameEnum.NOTIFICATION_SUBSCRIBER_EVENT];

    const processWorkflowSeries = mixpanelData.series[MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP];
    const previousProcessWorkflowSeries =
      mixpanelData.time_comparison.series[MixpanelTriggerEventNameEnum.PROCESS_WORKFLOW_STEP];

    // Inbox data
    const inboxSeries = inboxData?.series ?? {};
    const previousInboxSeries = inboxData?.time_comparison.series ?? {};
    const inboxSessionInitializedSeries = inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED];
    const inboxUpdatePreferencesSeries = inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES];
    const inboxMarkNotificationSeries = inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION];
    const inboxUpdateActionSeries = inboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION];
    const previousInboxSessionInitializedSeries =
      previousInboxSeries[MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED];
    const previousInboxUpdatePreferencesSeries =
      previousInboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES];
    const previousInboxMarkNotificationSeries =
      previousInboxSeries[MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION];
    const previousInboxUpdateActionSeries = previousInboxSeries[MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION];

    if (
      !triggerEventSeries ||
      !processWorkflowSeries ||
      !triggerEventPreviousSeries ||
      !previousProcessWorkflowSeries
    ) {
      Logger.error('Required series data missing from Mixpanel response');

      return;
    }

    const organizationData: IOrganizationData = {
      workflowTrigger: {
        current: triggerEventSeries[orgId],
        previous: triggerEventPreviousSeries[orgId],
      },
      stepProcessing: {
        current: processWorkflowSeries[orgId],
        previous: previousProcessWorkflowSeries[orgId],
      },
      inbox: {
        current: {
          [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: inboxSessionInitializedSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: inboxUpdatePreferencesSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: inboxMarkNotificationSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: inboxUpdateActionSeries[orgId],
        },
        previous: {
          [MixpanelInboxSeriesNameEnum.INBOX_SESSION_INITIALIZED]: previousInboxSessionInitializedSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_PREFERENCES]: previousInboxUpdatePreferencesSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_MARK_NOTIFICATION]: previousInboxMarkNotificationSeries[orgId],
          [MixpanelInboxSeriesNameEnum.INBOX_UPDATE_ACTION]: previousInboxUpdateActionSeries[orgId],
        },
      },
    };

    const metrics: IOrganizationMetrics = {
      eventTriggers: this.metricsCalculator.calculateEventTriggersMetrics(
        organizationData.workflowTrigger.current,
        organizationData.workflowTrigger.previous
      ),
      channelBreakdown: this.metricsCalculator.calculateChannelBreakdown(
        organizationData.stepProcessing.current,
        organizationData.stepProcessing.previous
      ),
      workflowStats: this.metricsCalculator.calculateWorkflowStats(
        organizationData.workflowTrigger.current,
        organizationData.workflowTrigger.previous
      ),
      inboxMetrics: this.metricsCalculator.calculateInboxMetrics(
        organizationData.inbox?.current,
        organizationData.inbox?.previous,
        orgId,
        {
          from_date: inboxData!.time_comparison.date_range.from_date,
          to_date: inboxData!.date_range.from_date,
        }
      ),
    };

    await this.organizationNotification.sendOrganizationNotification(orgId, metrics, {
      from_date: mixpanelData!.time_comparison.date_range.from_date,
      to_date: mixpanelData!.date_range.to_date,
    });
  }
}
