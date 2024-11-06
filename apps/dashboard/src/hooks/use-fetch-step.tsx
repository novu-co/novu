import { useQuery } from '@tanstack/react-query';
import type { StepDataDto } from '@novu/shared';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { fetchStep } from '@/api/steps';

export const useFetchStep = ({ workflowSlug, stepSlug }: { workflowSlug: string; stepSlug: string }) => {
  const { currentEnvironment } = useEnvironment();
  const { data, isPending, error } = useQuery<StepDataDto>({
    queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id, workflowSlug, stepSlug],
    queryFn: () => fetchStep({ workflowSlug, stepSlug }),
    enabled: !!currentEnvironment?._id && !!stepSlug,
  });

  return {
    step: data,
    isPending,
    error,
  };
};
