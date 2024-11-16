import { INotificationTemplateStep } from '@novu/shared';
import { NotificationStep } from '../usecases/create-workflow/create-workflow.command';

import { shortId } from './generate-id';
import { generateUniqueId } from './generate-unique-short-id';

export async function generateUniqueStepShortId(
  currentStep: NotificationStep,
  templateSteps: INotificationTemplateStep[],
) {
  const stepsToExamine = [
    ...templateSteps,
    ...templateSteps.flatMap((stepX) => stepX.variants || []),
  ];
  const otherStepsShortId = stepsToExamine
    .map((stepX) => stepX.shortId)
    .filter((id) => id != null && id !== currentStep.shortId);

  const stepShortId = await generateUniqueId(
    shortId(6),
    async (candidateShortId) => otherStepsShortId.includes(candidateShortId),
    () => shortId(6),
    'STEP_SHORT_ID_GENERATION',
  );

  return stepShortId;
}
