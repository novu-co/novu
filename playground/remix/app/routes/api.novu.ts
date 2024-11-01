import { serve, workflow } from '@novu/framework/remix';

export const testWorkflow = workflow('test-wf', async ({ step }) => {
  await step.inApp('send-in-app', async (controls) => ({
    subject: controls.subject,
    body: controls.body,
  }));
});

const handler = serve({
  workflows: [testWorkflow],
});

export { handler as action, handler as loader };
