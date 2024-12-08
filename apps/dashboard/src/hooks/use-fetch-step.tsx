import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StepDataDto, StepUpdateDto } from '@novu/shared';

import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { getStep } from '@/api/steps';
import { getEncodedId, STEP_DIVIDER, WORKFLOW_DIVIDER } from '@/utils/step';

export const useFetchStep = ({ workflowSlug, stepSlug }: { workflowSlug: string; stepSlug: string }) => {
  const client = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const queryKey = useMemo(
    () => [
      QueryKeys.fetchWorkflow,
      currentEnvironment?._id,
      getEncodedId({ slug: workflowSlug, divider: WORKFLOW_DIVIDER }),
      getEncodedId({ slug: stepSlug, divider: STEP_DIVIDER }),
    ],
    [currentEnvironment?._id, workflowSlug, stepSlug]
  );

  const { data, isPending, isRefetching, error } = useQuery<StepDataDto>({
    queryKey,
    queryFn: () => getStep({ environment: currentEnvironment!, workflowSlug: workflowSlug, stepSlug: stepSlug }),
    enabled: !!currentEnvironment?._id && !!stepSlug && !!workflowSlug,
  });

  const updateStepCache = useCallback(
    (newStep: Partial<StepUpdateDto>) => {
      const oldData = client.getQueryData<StepDataDto>(queryKey);
      const newStepData: Partial<StepDataDto> = {
        ...oldData,
        name: newStep.name,
        ...(newStep.controlValues ? { controls: { ...oldData?.controls, values: newStep.controlValues } } : {}),
      };
      client.setQueryData(queryKey, newStepData);
    },
    [client, queryKey]
  );

  return {
    step: data,
    isPending,
    isRefetching,
    error,
    updateStepCache,
  };
};
