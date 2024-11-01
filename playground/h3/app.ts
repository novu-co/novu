import { createApp, eventHandler, toNodeListener } from 'h3';
import { serve, workflow } from '@novu/framework/h3';
import { createServer } from 'node:http';

export const testWorkflow = workflow('test-wf', async ({ step }) => {
  await step.inApp('send-in-app', async (controls) => ({
    subject: controls.subject,
    body: controls.body,
  }));
});

export const app = createApp();

app.use('/api/novu', eventHandler(serve({ workflows: [testWorkflow] })));

createServer(toNodeListener(app)).listen(4000);
