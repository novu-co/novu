import { ListWorkflowResponse } from '@novu/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getV2 } from '@/api/api.client';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '../context/environment/hooks';

interface UseWorkflowsParams {
  limit?: number;
  offset?: number;
}

export function useWorkflows({ limit = 12, offset = 0 }: UseWorkflowsParams = {}) {
  const { currentEnvironment } = useEnvironment();

  const workflowsQuery = useQuery({
    queryKey: [QueryKeys.fetchWorkflows, currentEnvironment?._id, { limit, offset }],
    queryFn: async () => {
      const { data } = await getV2<{ data: ListWorkflowResponse }>(`/workflows?limit=${limit}&offset=${offset}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = workflowsQuery.data ? Math.ceil(workflowsQuery.data.totalCount / limit) : 0;

  return {
    ...workflowsQuery,
    currentPage,
    totalPages,
  };
}
