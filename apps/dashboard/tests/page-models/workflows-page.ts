import { type Page } from '@playwright/test';
import { expect } from '../utils/base-test';

export class WorkflowsPage {
  constructor(private page: Page) {}

  async goTo(): Promise<void> {
    await this.page.goto('/');
  }

  async waitWorkflowListNavigation(): Promise<void> {
    await expect(this.page).toHaveTitle(/Workflows | Novu Cloud Dashboard/);
  }

  async createWorkflowBtnClick(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create workflow' }).first().click();
  }

  async verifyWorkflowExists(workflowName: string): Promise<void> {
    const workflow = await this.page.getByRole('link').filter({ hasText: workflowName });
    await expect(workflow).toBeVisible();
  }

  async verifyWorkflowDoesntExists(workflowName: string): Promise<void> {
    const workflow = await this.page.getByRole('link').filter({ hasText: workflowName });
    await expect(workflow).not.toBeVisible();
  }

  async clickWorkflowName(workflowName: string): Promise<void> {
    const workflow = await this.page.getByRole('link').filter({ hasText: workflowName });
    await workflow.click();
  }

  async vefifyWorkflowActive(workflowName: string): Promise<void> {
    const workflowRow = await this.page.getByRole('row').filter({ hasText: workflowName });
    const activeBadge = await workflowRow.locator('td', { hasText: 'Active' });
    await expect(activeBadge).toBeVisible();
  }

  async vefifyWorkflowInactive(workflowName: string): Promise<void> {
    const workflowRow = await this.page.getByRole('row').filter({ hasText: workflowName });
    const inactiveBadge = await workflowRow.locator('td', { hasText: 'Inactive' });
    await expect(inactiveBadge).toBeVisible();
  }

  async clickWorkflowActionsMenu(workflowName: string): Promise<void> {
    const workflowRow = await this.page.getByRole('row').filter({ hasText: workflowName });
    const workflowActions = await workflowRow.getByTestId('workflow-actions-menu');
    await workflowActions.click();
  }

  async pauseWorkflow(): Promise<void> {
    const pauseAction = await this.page.getByTestId('pause-workflow');
    await expect(pauseAction).toBeVisible();
    await pauseAction.click();

    const pauseModal = await this.page.getByRole('dialog');
    const proceedBtn = await pauseModal.getByRole('button').filter({ hasText: 'Proceed' });
    await proceedBtn.click();

    await this.page.waitForResponse(
      (resp) => resp.url().includes('/v2/workflows') && resp.request().method() === 'PATCH' && resp.status() === 200
    );
    await expect(pauseModal).not.toBeVisible();
    await this.page.waitForTimeout(200);
  }

  async enableWorkflow(): Promise<void> {
    const enableWorkflow = await this.page.getByTestId('enable-workflow');
    await expect(enableWorkflow).toBeVisible();
    await enableWorkflow.click();

    await this.page.waitForResponse(
      (resp) => resp.url().includes('/v2/workflows') && resp.request().method() === 'PATCH' && resp.status() === 200
    );
    await expect(enableWorkflow).not.toBeVisible();
    await this.page.waitForTimeout(200);
  }

  async deleteWorkflow(): Promise<void> {
    const deleteWorkflow = await this.page.getByTestId('delete-workflow');
    await expect(deleteWorkflow).toBeVisible();
    await deleteWorkflow.click();

    const deleteWorkflowModal = await this.page.getByRole('dialog');
    const deleteBtn = await deleteWorkflowModal.getByRole('button').filter({ hasText: 'Delete' });
    await deleteBtn.click();
  }

  async checkDeleteOption({ isDisabled = false }: { isDisabled?: boolean } = {}): Promise<void> {
    const deleteWorkflow = await this.page.getByTestId('delete-workflow');

    await expect(await deleteWorkflow.isDisabled()).toEqual(isDisabled);
  }
}
