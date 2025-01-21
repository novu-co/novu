import { DefaultPagination } from '@/components/default-pagination';
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
import { WorkflowListEmpty } from '@/components/workflow-list-empty';
import { WorkflowRow } from '@/components/workflow-row';
import { useFetchWorkflows } from '@/hooks/use-fetch-workflows';
import { RiArrowDownSFill, RiArrowUpSFill, RiExpandUpDownFill, RiMore2Fill } from 'react-icons/ri';
import { createSearchParams, useLocation, useSearchParams } from 'react-router-dom';
import { ServerErrorPage } from './shared/server-error-page';

type SortableColumn = 'name' | 'updatedAt';

interface WorkflowListProps {
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function WorkflowList({ hasActiveFilters, onClearFilters }: WorkflowListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const hrefFromOffset = (offset: number) => {
    return `${location.pathname}?${createSearchParams({
      ...searchParams,
      offset: offset.toString(),
    })}`;
  };

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '12');
  const query = searchParams.get('query') || '';
  const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';
  const orderByField = (searchParams.get('orderByField') || 'updatedAt') as SortableColumn;

  const { data, isLoading, isError, currentPage, totalPages } = useFetchWorkflows({
    limit,
    offset,
    query,
    orderByField,
    orderDirection,
  });

  const toggleSort = (column: SortableColumn) => {
    const newDirection = column === orderByField ? (orderDirection === 'desc' ? 'asc' : 'desc') : 'desc';
    searchParams.set('orderDirection', newDirection);
    searchParams.set('orderByField', column);
    setSearchParams(searchParams);
  };

  const getSortingIcon = (state: 'asc' | 'desc' | false) => {
    if (state === 'asc') return <RiArrowUpSFill className="text-text-sub-600 size-4" />;
    if (state === 'desc') return <RiArrowDownSFill className="text-text-sub-600 size-4" />;

    return <RiExpandUpDownFill className="text-text-sub-600 size-4" />;
  };

  const SortButton = ({ column, children }: { column: SortableColumn; children: React.ReactNode }) => (
    <div
      role="button"
      className="hover:text-foreground-900 flex cursor-pointer items-center gap-1"
      onClick={() => toggleSort(column)}
    >
      {children}
      {getSortingIcon(orderByField === column ? orderDirection : false)}
    </div>
  );

  if (isError) return <ServerErrorPage />;

  if (!isLoading && data?.totalCount === 0) {
    return <WorkflowListEmpty emptySearchResults={hasActiveFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="flex h-full flex-col px-2.5 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton column="name">Workflows</SortButton>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Steps</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>
              <SortButton column="updatedAt">Last updated</SortButton>
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
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
            <>{data?.workflows.map((workflow) => <WorkflowRow key={workflow._id} workflow={workflow} />)}</>
          )}
        </TableBody>
        {data && limit < data.totalCount && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex items-center justify-between">
                  {data ? (
                    <span className="text-foreground-600 block text-sm font-normal">
                      Page {currentPage} of {totalPages}
                    </span>
                  ) : (
                    <Skeleton className="h-5 w-[20ch]" />
                  )}
                  {data ? (
                    <DefaultPagination
                      hrefFromOffset={hrefFromOffset}
                      totalCount={data.totalCount}
                      limit={limit}
                      offset={offset}
                    />
                  ) : (
                    <Skeleton className="h-5 w-32" />
                  )}
                </div>
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
