import { useMemo, type ReactNode } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { StepTypeEnum } from '@novu/shared';

import { StepEditorContext } from './step-editor-context';
import { useFetchStep } from '@/hooks/use-fetch-step';
import { useWorkflowEditorContext } from '../hooks';
import { getEncodedId, STEP_DIVIDER } from '@/utils/step';

export const StepEditorProvider = ({ children }: { children: ReactNode }) => {
  const { workflowSlug = '', stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const { state } = useLocation();
  const { workflow } = useWorkflowEditorContext();
  const {
    step,
    isPending: isPendingStep,
    isRefetching: isRefetchingStep,
    refetch,
  } = useFetchStep({
    workflowSlug,
    stepSlug,
  });

  const navigationStepType = state?.stepType as StepTypeEnum | undefined;
  const stepType = useMemo(
    () =>
      navigationStepType ??
      workflow?.steps.find(
        (el) =>
          getEncodedId({ slug: el.slug, divider: STEP_DIVIDER }) ===
          getEncodedId({ slug: stepSlug, divider: STEP_DIVIDER })
      )?.type,
    [navigationStepType, stepSlug, workflow]
  );

  const value = useMemo(
    () => ({ isPendingStep, isRefetchingStep, step, stepType, refetch }),
    [isPendingStep, isRefetchingStep, step, stepType, refetch]
  );

  return <StepEditorContext.Provider value={value}>{children}</StepEditorContext.Provider>;
};
