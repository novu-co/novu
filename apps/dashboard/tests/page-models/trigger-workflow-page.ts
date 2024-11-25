import { type Page } from '@playwright/test';
import { expect } from '../utils/base-test';

export class TriggerWorkflowPage {
  constructor(private page: Page) {}

  async waitTriggerWorkflowNavigation(workflowName: string): Promise<void> {
    await expect(this.page).toHaveTitle(`Trigger ${workflowName} | Novu Cloud Dashboard`);
  }

  async triggerWorkflowBtnClick(): Promise<void> {
    const triggerWorkflowBtn = await this.page.getByRole('button', { name: 'Test workflow' });
    await triggerWorkflowBtn.click();
  }

  async checkSuccessfulToastShown(): Promise<void> {
    const toastItem = await this.page
      .getByRole('listitem')
      .filter({ hasText: 'Test workflow triggered successfully' })
      .first();
    await expect(toastItem).toBeVisible();
  }
}
