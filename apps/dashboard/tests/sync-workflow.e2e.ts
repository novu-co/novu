import { expect, test } from '@playwright/test';
import { workflow } from '@novu/framework';
import { StepTypeEnum } from '@novu/shared';
import { InAppStepEditor } from './page-object-models/in-app-step-editor';
import { WorkflowsPage } from './page-object-models/workflows-page';
import { WorkflowEditorPage } from './page-object-models/workflow-editor-page';
import { StepConfigSidebar } from './page-object-models/step-config-sidebar';
import { TriggerWorkflowPage } from './page-object-models/trigger-workflow-page';
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
});

test.afterEach(async () => {
  await bridgeServer.stop();
});

test('sync workflow', async ({ page }) => {
  // go to the workflows page
  const workflowsPage = new WorkflowsPage(page);
  await workflowsPage.goTo();
  await expect(page).toHaveTitle(`Workflows | Novu Cloud Dashboard`);

  // check the workflow
  const workflowElement = await workflowsPage.getWorkflowElement(workflowId);
  await expect(workflowElement).toBeVisible();
  await workflowsPage.clickWorkflowName(workflowId);

  // check the workflow editor page
  const workflowEditorPage = new WorkflowEditorPage(page);
  await expect(page).toHaveTitle(`${workflowId} | Novu Cloud Dashboard`);

  // check the step count
  const stepCount = await workflowEditorPage.getStepCount(StepTypeEnum.IN_APP);
  await expect(stepCount).toEqual(1);

  // check the last step
  await workflowEditorPage.clickLastStep(StepTypeEnum.IN_APP);

  const stepConfigSidebar = new StepConfigSidebar(page);
  await expect(page).toHaveTitle(`Configure ${inAppStepId} | Novu Cloud Dashboard`);

  // Verify step name input
  const stepNameValue = await stepConfigSidebar.getStepNameInputValue();
  const isStepNameDisabled = await stepConfigSidebar.isStepNameInputDisabled();
  await expect(stepNameValue).toEqual(inAppStepId);
  await expect(isStepNameDisabled).toBeTruthy();

  // Verify step identifier input
  const stepIdValue = await stepConfigSidebar.getStepIdentifierInputValue();
  const stepIdReadonly = await stepConfigSidebar.getStepIdentifierReadonlyAttribute();
  await expect(stepIdValue).toEqual(inAppStepId);
  await expect(stepIdReadonly).toEqual('');

  await stepConfigSidebar.configureTemplateClick();

  const inAppStepEditor = new InAppStepEditor(page);

  // Wait for navigation and check title
  await page.waitForResponse('**/v2/workflows/**');
  const title = await page.title();
  await expect(title).toBe(`Edit ${inAppStepId} | Novu Cloud Dashboard`);

  // Verify custom controls form
  const controlElements = await inAppStepEditor.getCustomControlElements({
    customControls: [{ name: 'Name', defaultValue: 'John' }],
  });

  for (const element of controlElements) {
    await expect(element.label).toBeVisible();
    await expect(element.input).toBeVisible();
  }

  // Fill custom control field and verify saved state
  await inAppStepEditor.toggleOverrideDefaults();
  await inAppStepEditor.fillCustomControlField({ value: 'Tim', oldValue: 'John' });
  const savedIndicator = await inAppStepEditor.getSavedIndicator();
  await expect(savedIndicator).toBeVisible();

  // Check preview
  await inAppStepEditor.previewTabClick();
  const previewElements = await inAppStepEditor.getPreviewElements();
  await expect(previewElements.subject).toContainText(`Hi Tim! You've been invited to join the Novu project`);
  await expect(previewElements.body).toContainText(body);

  // close the step editor
  await inAppStepEditor.close();

  // go to the trigger tab
  await workflowEditorPage.triggerTabClick();

  // check the trigger workflow page
  const triggerWorkflowPage = new TriggerWorkflowPage(page);
  await expect(page).toHaveTitle(`Trigger ${workflowId} | Novu Cloud Dashboard`);

  // trigger the workflow
  await triggerWorkflowPage.triggerWorkflowBtnClick();
  const activityPanel = await triggerWorkflowPage.getActivityPanel();
  await expect(activityPanel).toBeVisible();
  await expect(activityPanel.locator('span').filter({ hasText: workflowId })).toBeVisible();

  // go to the workflows page
  await workflowEditorPage.clickWorkflowsBreadcrumb();
  await expect(page).toHaveTitle(`Workflows | Novu Cloud Dashboard`);

  // check the delete workflow button
  await workflowsPage.clickWorkflowActionsMenu(workflowId);
  const deleteWorkflowButton = await workflowsPage.getDeleteWorkflowButton();
  await expect(deleteWorkflowButton).toBeDisabled();
});
