import { workflow } from '@novu/framework';
import { z } from 'zod';
import { renderEmail } from './email';

export const testWorkflow = workflow(
  'usage-limits',
  async ({ step }) => {
    await step.email('email', async (controls) => {
      return {
        subject: 'You have reached your usage limits',
        body: await renderEmail(controls),
      };
    });
  },
  {
    name: 'Usage Limits Alert',
    payloadSchema: z.object({
      email: z.string(),
    }),
  }
);
