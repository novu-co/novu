import { type Page } from '@playwright/test';
import { expect } from '../utils/base-test';

export class CreateWorkflowSidebar {
  constructor(private page: Page) {}

  async createBtnClick({ awaitResponse = false } = {}): Promise<void> {
    const createWorkflowBtn = await this.page.getByRole('button', { name: 'Create workflow' });
    await createWorkflowBtn.click();

    if (awaitResponse) {
      await this.page.waitForResponse(
        (resp) => resp.url().includes('/v2/workflows') && resp.request().method() === 'POST' && resp.status() === 201
      );
    }
  }

  async expectNameValidationError(): Promise<void> {
    await expect(await this.page.getByText('Name is required')).toBeVisible();
  }

  async expectTagsValidationError(): Promise<void> {
    await expect(await this.page.getByText('Tags must contain at most 16')).toBeVisible();
  }

  async fillForm({
    workflowName,
    workflowId,
    workflowDescription,
    tags,
  }: {
    workflowName: string;
    workflowId: string;
    workflowDescription: string;
    tags: string[] | number;
  }): Promise<void> {
    // fill the workflow name
    await this.page.locator('input[name="name"]').fill(workflowName);
    const workflowIdInput = await this.page.locator('input[name="workflowId"]');

    // check the workflow id
    await expect(await workflowIdInput.inputValue()).toEqual(workflowId);

    // fill the tags
    const tagsInput = await this.page.getByPlaceholder('Type a tag and press Enter');
    if (typeof tags === 'number') {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tags; i++) {
        await tagsInput.click();
        await tagsInput.fill(`${1 + i}`);
        await tagsInput.press('Enter');
      }
    } else {
      for (const tag of tags) {
        await tagsInput.click();
        await tagsInput.fill(tag);
        await tagsInput.press('Enter');
      }
    }

    // fill the description
    const descriptionTextArea = await this.page.getByPlaceholder('Description of what this workflow does');
    await descriptionTextArea.click();
    await descriptionTextArea.fill(workflowDescription);
  }

  async removeTag(tag: string): Promise<void> {
    const removeBtn = await this.page.getByTestId(`tags-badge-remove-${tag}`);
    await removeBtn.click();
  }
}
