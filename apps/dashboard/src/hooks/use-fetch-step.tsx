import { useQuery } from '@tanstack/react-query';
import type { StepDataDto } from '@novu/shared';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { fetchStep } from '@/api/steps';
import { getEncodedId, STEP_DIVIDER } from '@/utils/step';

export const useFetchStep = ({ workflowSlug, stepSlug }: { workflowSlug?: string; stepSlug?: string }) => {
  const { currentEnvironment } = useEnvironment();

  const { data, isPending, isRefetching, error, refetch } = useQuery<StepDataDto>({
    queryKey: [
      QueryKeys.fetchWorkflow,
      currentEnvironment?._id,
      workflowSlug,
      getEncodedId({ slug: stepSlug!, divider: STEP_DIVIDER }),
    ],
    queryFn: () => fetchStep({ workflowSlug: workflowSlug!, stepSlug: stepSlug! }),
    enabled: !!currentEnvironment?._id && !!stepSlug && !!workflowSlug,
  });

  return {
    step: data,
    isPending,
    isRefetching,
    error,
    refetch,
  };
};
