import { renderAsync } from '@react-email/components';
import { workflow } from '@novu/framework';
import { z } from 'zod';
import UsageInsightsEmail from './email';
import { IUsageEmailData } from './types';
import { sampleUsageData } from './sample-data';

const marketingLinkSchema = z
  .object({
    href: z.string(),
    text: z.string(),
    emoji: z.string(),
  })
  .required();

async function renderUsageInsightsEmail(payload: IUsageEmailData, controls: any) {
  const html = await renderAsync(UsageInsightsEmail({ ...payload, marketingConfig: controls.marketingConfig }));

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
          marketingConfig: z
            .object({
              title: z.string().default('Discover More with Novu'),
              links: z.array(marketingLinkSchema),
              cta: z.object({
                text: z.string().default('Ready to take your notifications to the next level?'),
                buttonText: z.string().default('Upgrade Your Plan →'),
                buttonUrl: z.string().default('https://novu.co/pricing'),
              }),
            })
            .default({
              cta: {
                text: 'Ready to take your notifications to the next level?',
                buttonText: 'Upgrade Your Plan →',
                buttonUrl: 'https://novu.co/pricing',
              },
              links: [
                {
                  href: 'https://docs.novu.co',
                  text: 'Read our Documentation',
                  emoji: '📚',
                },
              ],
              title: 'Discover More with Novu',
            }),
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
        workflowStats: z.record(z.string(), channelMetricsSchema).default(sampleUsageData.workflowStats),
      })
      .required(),
  }
);
