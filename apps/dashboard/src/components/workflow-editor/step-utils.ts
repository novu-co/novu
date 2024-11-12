import { flatten } from 'flat';
import type { ContentIssue, StepIssuesDto } from '@novu/shared';

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
