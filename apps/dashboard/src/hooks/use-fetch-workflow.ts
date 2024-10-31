import { useQuery } from '@tanstack/react-query';
import type { WorkflowResponseDto } from '@novu/shared';
import { QueryKeys } from '@/utils/query-keys';
import { fetchWorkflow } from '@/api/workflows';
import { useEnvironment } from '@/context/environment/hooks';

export const useFetchWorkflow = ({ workflowSlug }: { workflowSlug?: string }) => {
  const { currentEnvironment } = useEnvironment();
  const { data, isPending, error } = useQuery<WorkflowResponseDto>({
    queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id, workflowSlug],
    queryFn: () => fetchWorkflow({ workflowSlug }),
    enabled: !!currentEnvironment?._id && !!workflowSlug,
  });

  return {
    workflow: data,
    isPending,
    error,
  };
};
