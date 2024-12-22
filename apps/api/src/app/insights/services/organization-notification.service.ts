import { Injectable, Logger } from '@nestjs/common';
import { CommunityOrganizationRepository } from '@novu/dal';
import { FeatureFlagsService } from '@novu/application-generic';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { usageInsightsWorkflow } from '@novu/notifications';

import { IDateRange, ICombinedMetrics, IMixpanelResponse } from '../usecases/usage-insights/types/usage-insights.types';

@Injectable()
export class OrganizationNotificationService {
  constructor(
    private organizationRepository: CommunityOrganizationRepository,
    private featureFlagsService: FeatureFlagsService
  ) {}

  async sendOrganizationNotification(
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
          email: `george+testing-${organization._id}@novu.co`,
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
}
