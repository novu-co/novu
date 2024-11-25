import { test } from '@playwright/test';
import { workflow } from '@novu/framework';
import { StepTypeEnum } from '@novu/shared';
import { InAppStepEditor } from './page-models/in-app-step-editor';
import { WorkflowsPage } from './page-models/workflows-page';
import { WorkflowEditorPage } from './page-models/workflow-editor-page';
import { StepConfigSidebar } from './page-models/step-config-sidebar';
import { TriggerWorkflowPage } from './page-models/trigger-workflow-page';
import { BridgeServer } from './utils/bridge-server';
import { initializeSession } from './utils/session';

const workflowId = 'code-created-workflow';
const inAppStepId = 'send-in-app';
const body = 'To join the Novu project, click the link below';

let bridgeServer: BridgeServer;
test.beforeEach(async ({ page }) => {
  const session = await initializeSession({ page });
  bridgeServer = new BridgeServer({ secretKey: session.environment.apiKeys[0].key, apiUrl: process.env.API_URL });

  const newWorkflow = workflow(workflowId, async ({ step }) => {
    await step.inApp(
      inAppStepId,
      async (controls) => {
        return {
          subject: `Hi ${controls.name}! You've been invited to join the Novu project`,
          body,
        };
      },
      {
        controlSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', default: 'John' },
          },
        } as const,
      }
    );
  });
  await bridgeServer.start({ workflows: [newWorkflow] });
  await session.testAgent.post(`/v1/bridge/sync`).send({
    bridgeUrl: bridgeServer.serverPath,
  });
  await page.waitForTimeout(2000);
});

test.afterEach(async () => {
  await bridgeServer.stop();
});

test('code defined workflow user journey', async ({ page }) => {
  const workflowsPage = new WorkflowsPage(page);
  await workflowsPage.goTo();
  await workflowsPage.waitWorkflowListNavigation();
  await workflowsPage.verifyWorkflowExists(workflowId);
  await workflowsPage.clickWorkflowName(workflowId);

  const workflowEditorPage = new WorkflowEditorPage(page);
  await workflowEditorPage.waitWorkflowEditorNavigation(workflowId);
  await workflowEditorPage.verifyStepsCount({ count: 1, stepType: StepTypeEnum.IN_APP });
  await workflowEditorPage.clickLastStep(StepTypeEnum.IN_APP);

  const stepConfigSidebar = new StepConfigSidebar(page);
  await stepConfigSidebar.waitStepConfigSidebarNavigation(inAppStepId);
  await stepConfigSidebar.verifyStepNameInput({ stepIndex: 0, stepName: inAppStepId, disabled: true });
  await stepConfigSidebar.verifyStepIdentifierInput({ stepIndex: 0, stepId: inAppStepId, isReadOnly: true });
  await stepConfigSidebar.configureTemplateClick();

  const inAppStepEditor = new InAppStepEditor(page);
  await inAppStepEditor.waitInAppStepEditorNavigation(inAppStepId);
  // TODO fix the default value to John when the bug is fixed
  await inAppStepEditor.verifyCustomControlsForm({ customControls: [{ name: 'Name', defaultValue: 'Name' }] });
  await inAppStepEditor.fillCustomControlField({ value: 'Tim', oldValue: 'Name' });
  await inAppStepEditor.save();
  await inAppStepEditor.previewTabClick();
  await inAppStepEditor.checkPreview({ subject: `Hi Tim! You've been invited to join the Novu project`, body });
  await inAppStepEditor.close();

  await workflowEditorPage.triggerTabClick();

  const triggerWorkflowPage = new TriggerWorkflowPage(page);
  await triggerWorkflowPage.waitTriggerWorkflowNavigation(workflowId);
  await triggerWorkflowPage.triggerWorkflowBtnClick();
  await triggerWorkflowPage.checkSuccessfulToastShown();

  await workflowEditorPage.clickWorkflowsBreadcrumb();

  await workflowsPage.waitWorkflowListNavigation();
  await workflowsPage.clickWorkflowActionsMenu(workflowId);
  await workflowsPage.checkDeleteOption({ isDisabled: true });
});
