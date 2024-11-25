import { expect, type Page } from '@playwright/test';

export class InAppStepEditor {
  constructor(private page: Page) {}

  async waitInAppStepEditorNavigation(stepName: string): Promise<void> {
    await expect(this.page).toHaveTitle(`Edit ${stepName} | Novu Cloud Dashboard`);
  }

  async expectBodyValidationError(): Promise<void> {
    await expect(await this.page.getByText('Body is missing')).toBeVisible();
  }

  async fillForm({
    subject,
    body,
    action,
  }: {
    subject: string;
    body: string;
    action: 'none' | 'primary' | 'both';
  }): Promise<void> {
    const subjectField = await this.page.locator('div[contenteditable="true"]', {
      hasText: 'Subject',
    });
    await subjectField.click({ force: true });
    await subjectField.fill(subject);

    const bodyField = await this.page.locator('div[contenteditable="true"]', {
      hasText: 'Body',
    });
    await bodyField.click({ force: true });
    await bodyField.fill(body);

    const actionDropdownTrigger = await this.page.getByTestId('in-app-action-dropdown-trigger');
    await actionDropdownTrigger.click();
    if (action === 'primary') {
      const primaryAction = await this.page.getByRole('menuitem').filter({ hasText: 'Primary action' }).first();
      await primaryAction.click();
    } else if (action === 'both') {
      const bothActions = await this.page.getByRole('menuitem').filter({ hasText: 'Secondary action' });
      await bothActions.click();
    } else {
      const noAction = await this.page.getByRole('menuitem').filter({ hasText: 'No action' });
      await noAction.click();
    }
  }

  async save(): Promise<void> {
    const saveButton = await this.page.getByRole('button', { name: 'Save step' });
    await saveButton.click();

    await this.page.waitForResponse('**/v2/workflows/**');
  }

  async previewTabClick(): Promise<void> {
    const preview = await this.page.getByRole('tab').filter({ hasText: 'Preview' });
    await preview.click();
  }

  async checkPreview({ subject, body }: { subject: string; body: string }): Promise<void> {
    await expect(await this.page.getByTestId('in-app-preview-subject')).toContainText(subject);
    await expect(await this.page.getByTestId('in-app-preview-body')).toContainText(body);
  }

  async close(): Promise<void> {
    const closeSidebar = await this.page.getByRole('button').filter({ hasText: 'Close' });
    await closeSidebar.click();
  }

  async verifyCustomControlsForm({
    customControls,
  }: {
    customControls: Array<{ name: string; value?: string; defaultValue?: string }>;
  }): Promise<void> {
    for (const control of customControls) {
      const label = await this.page.locator('label', { hasText: new RegExp(`^${control.name}$`) });
      await expect(label).toBeVisible();

      const input = await this.page.locator('div[contenteditable="true"]', {
        hasText: control.defaultValue ?? control.value,
      });
      await expect(input).toBeVisible();
    }
  }

  async fillCustomControlField({ value, oldValue }: { value: string; oldValue: string }): Promise<void> {
    const input = await this.page.locator('div[contenteditable="true"]', {
      hasText: oldValue,
    });
    await input.click({ force: true });
    await input.fill(value);
  }
}
