import { type Page } from '@playwright/test';
import os from 'node:os';

const isMac = os.platform() === 'darwin';
const modifier = isMac ? 'Meta' : 'Control';

export class InAppStepEditor {
  constructor(private page: Page) {}

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getBodyValidationError() {
    return await this.page.getByText('Body is required');
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
    await subjectField.click();
    await subjectField.fill(subject);
    await this.page.waitForTimeout(50);

    const bodyField = await this.page.locator('div[contenteditable="true"]', {
      hasText: 'Body',
    });
    await bodyField.click();
    await bodyField.fill(body);
    await this.page.waitForTimeout(50);

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

  async clickOnSidebar() {
    const header = this.page.locator('header', { hasText: 'Configure Template' });
    await header.click();
  }

  async getSavedIndicator() {
    await this.clickOnSidebar();

    return await this.page.locator('ol li:first-child', { hasText: 'Saved' });
  }

  async previewTabClick(): Promise<void> {
    const preview = await this.page.getByRole('tab').filter({ hasText: 'Preview' });
    await preview.click();
  }

  async getPreviewElements() {
    return {
      subject: await this.page.getByTestId('in-app-preview-subject'),
      body: await this.page.getByTestId('in-app-preview-body'),
    };
  }

  async close(): Promise<void> {
    const closeSidebar = await this.page.getByRole('button').filter({ hasText: 'Close' });
    await closeSidebar.click();
  }

  async getCustomControlElements({
    customControls,
  }: {
    customControls: Array<{ name: string; value?: string; defaultValue?: string }>;
  }) {
    const elements = [];
    for (const control of customControls) {
      elements.push({
        label: await this.page.locator('label', { hasText: new RegExp(`^${control.name}$`) }),
        input: await this.page.locator('div[contenteditable="true"]', {
          hasText: control.defaultValue ?? control.value,
        }),
      });
    }

    return elements;
  }

  async fillCustomControlField({ value, oldValue }: { value: string; oldValue: string }): Promise<void> {
    const input = await this.page.locator('div[contenteditable="true"]', {
      hasText: oldValue,
    });
    await input.click({ force: true });
    await input.press(`${modifier}+KeyX`);
    await this.page.keyboard.type(value);

    await this.clickOnSidebar();
  }

  async toggleOverrideDefaults(): Promise<void> {
    const overrideDefaults = await this.page.getByTestId('override-defaults-switch');
    await overrideDefaults.click();
  }
}
