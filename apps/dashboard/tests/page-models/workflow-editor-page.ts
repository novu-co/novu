import { expect, type Page } from '@playwright/test';
import { StepTypeEnum } from '@novu/shared';

export class WorkflowEditorPage {
  constructor(private page: Page) {}

  async waitWorkflowEditorNavigation(workflowName: string): Promise<void> {
    await expect(this.page).toHaveTitle(`${workflowName} | Novu Cloud Dashboard`);
  }

  async verifyWorkflowForm({
    workflowName,
    workflowId,
    workflowDescription,
    tags,
  }: {
    workflowName: string;
    workflowId: RegExp | string;
    workflowDescription: string;
    tags: string[] | number;
  }): Promise<void> {
    const workflowNameInput = await this.page.locator('input[name="name"]');
    await expect(await workflowNameInput.inputValue()).toEqual(workflowName);

    const workflowIdInput = await this.page.locator('input[name="workflowId"]');
    await expect(await workflowIdInput.inputValue()).toMatch(workflowId);

    const tagBadges = await this.page.getByTestId('tags-badge-value');
    if (typeof tags === 'number') {
      await expect(await tagBadges.count()).toEqual(tags);
    } else {
      tags.forEach(async (tag) => {
        await expect(tagBadges).toContainText(tag);
      });
    }

    const descriptionTextArea = await this.page.locator('textarea[name="description"]');
    await expect(await descriptionTextArea.inputValue()).toEqual(workflowDescription);
  }

  async updateWorkflowName(workflowName: string): Promise<void> {
    const workflowNameInput = await this.page.locator('input[name="name"]');
    await workflowNameInput.fill(workflowName);
    await workflowNameInput.blur();
    // await workflow name to be updated
    await this.page.waitForResponse('**/v2/workflows/**');
  }

  async addStepAsLast(stepType: StepTypeEnum): Promise<void> {
    const addStepMenuBtn = await this.page.getByTestId('add-step-menu-button').last();
    await addStepMenuBtn.click();

    const inAppMenuItem = await this.page.getByTestId(`add-step-menu-item-${stepType}`);
    await inAppMenuItem.click({ force: true });

    // await for the workflow steps to be updated
    await this.page.waitForResponse('**/v2/workflows/**');
  }

  async verifyLastStepVisible(stepType: StepTypeEnum): Promise<void> {
    const step = await this.page.getByTestId(`${stepType}-node`).last();
    await expect(step).toBeVisible();
  }

  async clickLastStep(stepType: StepTypeEnum): Promise<void> {
    const step = await this.page.getByTestId(`${stepType}-node`).last();
    await step.click();
  }

  async verifyStepsCount({ stepType, count }: { count: number; stepType: StepTypeEnum }): Promise<void> {
    await expect(await this.page.getByTestId(`${stepType}-node`).count()).toEqual(count);
  }

  async clickWorkflowsBreadcrumb(): Promise<void> {
    const workflowsLink = await this.page.getByRole('link').filter({ hasText: 'Workflows' });
    await workflowsLink.click();
  }

  async triggerTabClick(): Promise<void> {
    const triggerTab = await this.page.getByRole('tab').filter({ hasText: 'Trigger' });
    await triggerTab.click();
  }
}
