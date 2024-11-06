import { workflow } from '@novu/framework';
import { z } from 'zod';
import { renderUsageLimitsEmail } from './email';

export const usageLimitsWorkflow = workflow(
  'usage-limits',
  async ({ step }) => {
    await step.email('email', async (controls) => {
      return {
        subject: 'You have reached your usage limits',
        body: await renderUsageLimitsEmail(controls),
      };
    });
  },
  {
    name: 'Usage Limits Alert',
    payloadSchema: z.object({
      percentage: z.number(),
      organizationName: z.string(),
    }),
  }
);
