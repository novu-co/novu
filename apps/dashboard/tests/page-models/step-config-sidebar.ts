import { expect, type Page } from '@playwright/test';

export class StepConfigSidebar {
  constructor(private page: Page) {}

  async waitStepConfigSidebarNavigation(stepName: string): Promise<void> {
    await expect(this.page).toHaveTitle(`Configure ${stepName} | Novu Cloud Dashboard`);
  }

  async verifyStepNameInput({ stepName, disabled = false }: { stepName: string; disabled?: boolean }): Promise<void> {
    const stepNameInput = await this.page.locator(`input[name="name"]`);
    await expect(await stepNameInput.inputValue()).toEqual(stepName);
    await expect(await stepNameInput.isDisabled()).toEqual(disabled);
  }

  async verifyStepIdentifierInput({
    stepId,
    isReadOnly = false,
  }: {
    stepId: string;
    isReadOnly?: boolean;
  }): Promise<void> {
    const stepIdentifierInput = await this.page.locator(`input[name="stepId"]`);
    await expect(await stepIdentifierInput.inputValue()).toEqual(stepId);
    await expect(await stepIdentifierInput.getAttribute('readonly')).toEqual(isReadOnly ? '' : null);
  }

  async updateStepName({ oldStepName, newStepName }: { newStepName: string; oldStepName: string }): Promise<void> {
    const stepNameInput = await this.page.locator(`input[value="${oldStepName}"]`);
    await stepNameInput.fill(`${newStepName}`);
    await this.page.locator(`input[value="${newStepName}"]`).blur();

    // await for the step name to be updated
    await this.page.waitForResponse('**/v2/workflows/**');
  }

  async configureTemplateClick(): Promise<void> {
    const configureInAppTemplateBtn = await this.page.getByRole('link').filter({ hasText: /Configure.*/ });
    await configureInAppTemplateBtn.click();
  }

  async delete(): Promise<void> {
    const deleteStep = await this.page.getByRole('button').filter({ hasText: 'Delete step' });
    await deleteStep.click();

    const deleteStepModal = await this.page.getByRole('dialog');
    const deleteConfirm = await deleteStepModal.getByRole('button').filter({ hasText: 'Delete' });
    await deleteConfirm.click({ force: true });

    await this.page.waitForResponse('**/v2/workflows/**');
  }
}
