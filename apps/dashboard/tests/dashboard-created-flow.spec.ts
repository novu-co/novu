import { StepTypeEnum } from '@novu/shared';
import { test } from '@playwright/test';
import { InAppStepEditor } from './page-models/in-app-step-editor';
import { WorkflowsPage } from './page-models/workflows-page';
import { CreateWorkflowSidebar } from './page-models/create-workflow-sidebar';
import { WorkflowEditorPage } from './page-models/workflow-editor-page';
import { StepConfigSidebar } from './page-models/step-config-sidebar';
import { TriggerWorkflowPage } from './page-models/trigger-workflow-page';
import { initializeSession } from './utils/session';

test.beforeEach(async ({ page }) => {
  await initializeSession({ page });
});

test('dashboard defined workflow user journey', async ({ page }) => {
  const workflowName = 'test-workflow';
  const workflowId = workflowName;
  const workflowDescription = 'Test workflow description';
  const inAppStepName = 'In-App Step';
  const subject = 'You have been invited to join the Novu project';
  const body = "Hello {{payload.name}}! You've been invited to join the Novu project";

  const workflowsPage = new WorkflowsPage(page);
  await workflowsPage.goTo();
  await workflowsPage.waitWorkflowListNavigation();
  await workflowsPage.createWorkflowBtnClick();

  const createWorkflowSidebar = new CreateWorkflowSidebar(page);
  await createWorkflowSidebar.createBtnClick();
  await createWorkflowSidebar.expectNameValidationError();
  await createWorkflowSidebar.fillForm({
    workflowName,
    workflowId,
    workflowDescription,
    tags: 17,
  });

  await createWorkflowSidebar.createBtnClick();
  await createWorkflowSidebar.expectTagsValidationError();
  await createWorkflowSidebar.removeTag('17');
  await createWorkflowSidebar.createBtnClick({ awaitResponse: true });

  const workflowEditorPage = new WorkflowEditorPage(page);
  await workflowEditorPage.waitWorkflowEditorNavigation(workflowName);
  await workflowEditorPage.verifyWorkflowForm({
    workflowName,
    workflowId: /test-workflow.*/,
    workflowDescription,
    tags: 16,
  });
  const workflowNameUpdated = `${workflowName}-updated`;
  await workflowEditorPage.updateWorkflowName(workflowNameUpdated);
  await workflowEditorPage.addStepAsLast(StepTypeEnum.IN_APP);
  await workflowEditorPage.verifyLastStepVisible(StepTypeEnum.IN_APP);
  await workflowEditorPage.clickLastStep(StepTypeEnum.IN_APP);

  const stepConfirSidebar = new StepConfigSidebar(page);
  await stepConfirSidebar.waitStepConfigSidebarNavigation(inAppStepName);
  const inAppStepNameUpdated = `${inAppStepName}-updated`;
  await stepConfirSidebar.updateStepName({ oldStepName: inAppStepName, newStepName: inAppStepNameUpdated });
  await stepConfirSidebar.configureTemplateClick();

  const inAppStepEditor = new InAppStepEditor(page);
  await inAppStepEditor.waitInAppStepEditorNavigation(inAppStepNameUpdated);
  await inAppStepEditor.expectBodyValidationError();
  await inAppStepEditor.fillForm({
    subject,
    body,
    action: 'both',
  });
  await inAppStepEditor.save();
  await inAppStepEditor.previewTabClick();
  // TODO: add assertions for the primary and secondary actions
  await inAppStepEditor.checkPreview({
    subject,
    body,
  });
  await inAppStepEditor.close();

  await stepConfirSidebar.waitStepConfigSidebarNavigation(inAppStepNameUpdated);

  await workflowEditorPage.addStepAsLast(StepTypeEnum.IN_APP);
  await workflowEditorPage.verifyStepsCount({ count: 2, stepType: StepTypeEnum.IN_APP });
  await workflowEditorPage.verifyLastStepVisible(StepTypeEnum.IN_APP);
  await workflowEditorPage.clickLastStep(StepTypeEnum.IN_APP);

  await stepConfirSidebar.waitStepConfigSidebarNavigation(inAppStepName);
  await stepConfirSidebar.delete();

  await workflowEditorPage.verifyStepsCount({ count: 1, stepType: StepTypeEnum.IN_APP });
  await workflowEditorPage.triggerTabClick();

  const triggerWorkflowPage = new TriggerWorkflowPage(page);
  await triggerWorkflowPage.waitTriggerWorkflowNavigation(workflowNameUpdated);
  await triggerWorkflowPage.triggerWorkflowBtnClick();
  await triggerWorkflowPage.checkSuccessfulToastShown();

  await workflowEditorPage.clickWorkflowsBreadcrumb();

  await workflowsPage.waitWorkflowListNavigation();
  await workflowsPage.verifyWorkflowExists(workflowNameUpdated);
  await workflowsPage.vefifyWorkflowActive(workflowNameUpdated);

  await workflowsPage.clickWorkflowActionsMenu(workflowNameUpdated);
  await workflowsPage.pauseWorkflow();
  await workflowsPage.vefifyWorkflowInactive(workflowNameUpdated);

  await workflowsPage.clickWorkflowActionsMenu(workflowNameUpdated);
  await workflowsPage.enableWorkflow();
  await workflowsPage.vefifyWorkflowActive(workflowNameUpdated);

  await workflowsPage.clickWorkflowActionsMenu(workflowNameUpdated);
  await workflowsPage.deleteWorkflow();
  await workflowsPage.verifyWorkflowDoesntExists(workflowNameUpdated);
});
