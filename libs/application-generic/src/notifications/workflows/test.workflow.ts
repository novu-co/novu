import { workflow } from '@novu/framework';

export const testWorkflow = workflow('test-workflow', async ({ step }) => {
  await step.email('test-email', () => {
    return {
      subject: 'Test Email',
      body: 'Test Body',
    };
  });
});
