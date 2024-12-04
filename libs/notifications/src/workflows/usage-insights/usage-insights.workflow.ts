import { renderAsync } from '@react-email/components';
import { workflow } from '@novu/framework';
import { z } from 'zod';
import UsageInsightsEmail from './email';
import { IUsageEmailData } from './types';
import { sampleUsageData } from './sample-data';

async function renderUsageInsightsEmail(payload: IUsageEmailData, controls: any) {
  const html = await renderAsync(UsageInsightsEmail(payload));

  return html;
}

const channelMetricsSchema = z
  .object({
    current: z.number(),
    previous: z.number(),
    change: z.number(),
  })
  .required();

export const usageInsightsWorkflow = workflow(
  'usage-insights',
  async ({ step, payload }) => {
    await step.email(
      'email',
      async (controls) => {
        return {
          subject: controls.subject,
          body: await renderUsageInsightsEmail(payload as IUsageEmailData, controls),
        };
      },
      {
        controlSchema: z.object({
          subject: z.string().default('Your Monthly Usage Insights'),
          previewText: z.string().default('Here are your usage insights for {{payload.organizationName}}'),
        }),
      }
    );
  },
  {
    name: 'Usage Insights',
    payloadSchema: z
      .object({
        organizationName: z.string().default(sampleUsageData.organizationName),
        period: z
          .object({
            current: z.string().default(sampleUsageData.period.current),
            previous: z.string().default(sampleUsageData.period.previous),
          })
          .required(),
        subscriberNotifications: channelMetricsSchema.default(sampleUsageData.subscriberNotifications),
        channelBreakdown: z
          .object({
            email: channelMetricsSchema.default(sampleUsageData.channelBreakdown.email),
            sms: channelMetricsSchema.default(sampleUsageData.channelBreakdown.sms),
            push: channelMetricsSchema.default(sampleUsageData.channelBreakdown.push),
          })
          .required(),
        inboxMetrics: z
          .object({
            sessionInitialized: channelMetricsSchema.default(sampleUsageData.inboxMetrics.sessionInitialized),
            updatePreferences: channelMetricsSchema.default(sampleUsageData.inboxMetrics.updatePreferences),
            markNotification: channelMetricsSchema.default(sampleUsageData.inboxMetrics.markNotification),
            updateAction: channelMetricsSchema.default(sampleUsageData.inboxMetrics.updateAction),
          })
          .required(),
        workflowStats: z
          .object({
            'Welcome Flow': channelMetricsSchema.default(sampleUsageData.workflowStats['Welcome Flow']),
            'Order Confirmation': channelMetricsSchema.default(sampleUsageData.workflowStats['Order Confirmation']),
            'Password Reset': channelMetricsSchema.default(sampleUsageData.workflowStats['Password Reset']),
          })
          .required(),
      })
      .required(),
  }
);
