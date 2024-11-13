import type { ListWorkflowResponse } from '@novu/shared';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { RiMore2Fill } from 'react-icons/ri';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import { getV2 } from '@/api/api.client';
import { DefaultPagination } from '@/components/default-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Skeleton } from '@/components/primitives/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { useEnvironment } from '@/context/environment/hooks';
import { QueryKeys } from '@/utils/query-keys';
import { WorkflowRow } from '@/components/workflow-row';
import { WorkflowListEmpty } from '@/components/workflow-list-empty';

export const WorkflowList = () => {
  const { currentEnvironment } = useEnvironment();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const hrefFromOffset = (offset: number) => {
    return `${location.pathname}?${createSearchParams({
      ...searchParams,
      offset: offset.toString(),
    })}`;
  };

  const setLimit = (limit: number) => {
    setSearchParams((searchParams) => {
      searchParams.set('limit', limit.toString());
      return searchParams;
    });
  };

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '12');
  const workflowsQuery = useQuery({
    queryKey: [QueryKeys.fetchWorkflows, currentEnvironment?._id, { limit, offset }],
    queryFn: async () => {
      const { data } = await getV2<{ data: ListWorkflowResponse }>(`/workflows?limit=${limit}&offset=${offset}`);
      return data;
    },
    placeholderData: keepPreviousData,
  });
  const currentPage = Math.floor(offset / limit) + 1;

  if (workflowsQuery.isError) {
    return null;
  }

  if (!workflowsQuery.isPending && workflowsQuery.data.totalCount === 0) {
    return <WorkflowListEmpty />;
  }

  return (
    <div className="flex h-full flex-col px-2.5 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflows</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Steps</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last updated</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflowsQuery.isPending ? (
            <>
              {new Array(limit).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="flex flex-col gap-1 font-medium">
                    <Skeleton className="h-5 w-[20ch]" />
                    <Skeleton className="h-3 w-[15ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[6ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[8ch] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[7ch] rounded-full" />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    <Skeleton className="h-5 w-[14ch] rounded-full" />
                  </TableCell>
                  <TableCell className="text-foreground-600 text-sm font-medium">
                    <RiMore2Fill className="size-4 opacity-50" />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <>
              {workflowsQuery.data.workflows.map((workflow) => (
                <WorkflowRow workflow={workflow} />
              ))}
            </>
          )}
        </TableBody>
        {workflowsQuery.data && limit < workflowsQuery.data.totalCount && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex items-center justify-between">
                  {workflowsQuery.data ? (
                    <span className="text-foreground-600 block text-sm font-normal">
                      Page {currentPage} of {Math.ceil(workflowsQuery.data.totalCount / limit)}
                    </span>
                  ) : (
                    <Skeleton className="h-5 w-[20ch]" />
                  )}
                  {workflowsQuery.data ? (
                    <DefaultPagination
                      hrefFromOffset={hrefFromOffset}
                      totalCount={workflowsQuery.data.totalCount}
                      limit={limit}
                      offset={offset}
                    />
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                  <Select onValueChange={(v) => setLimit(parseInt(v))} defaultValue={limit.toString()}>
                    <SelectTrigger className="w-fit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 / page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};
