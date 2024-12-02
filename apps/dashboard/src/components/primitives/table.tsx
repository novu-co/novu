import * as React from 'react';

import { cn } from '@/utils/ui';
import { ClassNameValue } from 'tailwind-merge';
import { Skeleton } from './skeleton';

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassname?: ClassNameValue;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  isLoading?: boolean;
  loadingRows?: number;
  loadingRowsContent?: (index: number) => React.ReactNode;
}

const DefaultLoadingRow = () => (
  <TableRow>
    {Array.from({ length: 4 }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
    ))}
  </TableRow>
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassname, children, ...props }, ref) => (
    <div
      className={cn(
        'border-neutral-alpha-200 relative w-full overflow-x-auto rounded-md border shadow-sm',
        containerClassname
      )}
    >
      <table
        ref={ref}
        className={cn('relative w-full caption-bottom border-separate border-spacing-0 text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('sticky top-0 bg-neutral-50 shadow-[0_0_0_1px_hsl(var(--neutral-alpha-200))]', className)}
      {...props}
    />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  (
    { className, isLoading, loadingRows = 5, loadingRowsContent = () => <DefaultLoadingRow />, children, ...props },
    ref
  ) => (
    <tbody ref={ref} className={cn('', className)} {...props}>
      {isLoading ? Array.from({ length: loadingRows }).map((_, index) => loadingRowsContent(index)) : children}
    </tbody>
  )
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-background sticky bottom-0 shadow-[0_0_0_1px_hsl(var(--neutral-alpha-200))]', className)}
      {...props}
    />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('[&>td]:border-neutral-alpha-100 [&>td]:border-b [&>td]:last-of-type:border-0', className)}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'text-foreground-600 h-10 px-6 py-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn('px-6 py-2 align-middle', className)} {...props} />
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell };
