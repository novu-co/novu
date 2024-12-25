import { flatten } from 'flat';
import type {
  ContentIssue,
  StepIssuesDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateWorkflowDto,
  WorkflowResponseDto,
} from '@novu/shared';
import { Step } from '@/utils/types';
import { STEP_TYPE_LABELS } from '@/utils/constants';

export const getFirstBodyErrorMessage = (issues?: StepIssuesDto) => {
  const stepIssuesArray = Object.entries({ ...issues?.body });
  if (stepIssuesArray.length > 0) {
    const firstIssue = stepIssuesArray[0];
    const errorMessage = firstIssue[1]?.message;
    return errorMessage;
  }
};

export const getFirstControlsErrorMessage = (issues?: StepIssuesDto) => {
  const controlsIssuesArray = Object.entries({ ...issues?.controls });
  if (controlsIssuesArray.length > 0) {
    const firstIssue = controlsIssuesArray[0];
    const contentIssues = firstIssue?.[1];
    const errorMessage = contentIssues?.[0]?.message;
    return errorMessage;
  }
};

export const flattenIssues = (controlIssues?: Record<string, ContentIssue[]>): Record<string, string> => {
  const controlIssuesFlat: Record<string, ContentIssue[]> = flatten({ ...controlIssues }, { safe: true });

  return Object.entries(controlIssuesFlat).reduce((acc, [key, value]) => {
    const errorMessage = value.length > 0 ? value[0].message : undefined;
    if (!errorMessage) {
      return acc;
    }

    return { ...acc, [key]: errorMessage };
  }, {});
};

export const updateStepInWorkflow = (
  workflow: WorkflowResponseDto,
  stepId: string,
  updateStep: Partial<StepUpdateDto>
): UpdateWorkflowDto => {
  return {
    ...workflow,
    steps: workflow.steps.map((step) => {
      if (step.stepId === stepId) {
        return { ...step, ...updateStep };
      }
      return step;
    }),
  };
};

export const createStep = (type: StepTypeEnum): Step => ({
  name: STEP_TYPE_LABELS[type] + ' Step',
  stepId: '',
  slug: '_st_',
  type,
  _id: crypto.randomUUID(),
});
