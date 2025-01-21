import * as React from 'react';

import { cn } from '@/utils/ui';
import { RiArrowDownSFill, RiArrowUpSFill, RiExpandUpDownFill } from 'react-icons/ri';
import { ClassNameValue } from 'tailwind-merge';

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassname?: ClassNameValue;
  isLoading?: boolean;
  loadingRowsCount?: number;
  loadingRow?: React.ReactNode;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const LoadingRow = () => (
  <TableRow>
    <TableCell className="animate-pulse" colSpan={100}>
      <div className="h-8 w-full rounded-md bg-neutral-100" />
    </TableCell>
  </TableRow>
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassname, isLoading, loadingRowsCount = 5, loadingRow, children, ...props }, ref) => {
    const loadingRows = Array.from({ length: loadingRowsCount }).map(
      (_, i) => loadingRow && <React.Fragment key={i}>{loadingRow}</React.Fragment>
    );

    return (
      <div
        className={cn(
          'relative w-full overflow-auto rounded-lg border border-neutral-200 shadow-sm',
          containerClassname
        )}
      >
        <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props}>
          {children}
          {isLoading && loadingRow && loadingRows}
        </table>
      </div>
    );
  }
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, onSort, ...props }, ref) => {
    const content = (
      <div className={cn('flex items-center gap-1', sortable && 'hover:text-foreground-900 cursor-pointer')}>
        {children}
        {sortable && (
          <>
            {sortDirection === 'asc' && <RiArrowUpSFill className="text-text-sub-600 size-4" />}
            {sortDirection === 'desc' && <RiArrowDownSFill className="text-text-sub-600 size-4" />}
            {!sortDirection && <RiExpandUpDownFill className="text-text-sub-600 size-4" />}
          </>
        )}
      </div>
    );

    return (
      <th
        ref={ref}
        className={cn(
          'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
          className
        )}
        {...props}
      >
        {sortable ? (
          <div role="button" onClick={onSort}>
            {content}
          </div>
        ) : (
          content
        )}
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('bg-neutral-900 font-medium text-neutral-50', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b transition-colors hover:bg-neutral-100/50 data-[state=selected]:bg-neutral-100', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
));
TableCell.displayName = 'TableCell';

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
