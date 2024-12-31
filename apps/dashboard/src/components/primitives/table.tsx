import * as React from 'react';

import { cn } from '@/utils/ui';
import { cva } from 'class-variance-authority';
import { ClassNameValue } from 'tailwind-merge';

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  containerClassname?: ClassNameValue;
  isLoading?: boolean;
  loadingRowsCount?: number;
  loadingRow?: React.ReactNode;
}

const LoadingRow = () => (
  <TableRow>
    <TableCell className="animate-pulse" colSpan={100}>
      <div className="h-8 w-full rounded-md bg-neutral-100" />
    </TableCell>
  </TableRow>
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassname, isLoading, loadingRowsCount = 5, loadingRow, children, ...props }, ref) => (
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
        {isLoading && (
          <TableBody>
            {Array.from({ length: loadingRowsCount }).map((_, index) => (
              <React.Fragment key={index}>{loadingRow || <LoadingRow />}</React.Fragment>
            ))}
          </TableBody>
        )}
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

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('', className)} {...props} />
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

export const tableCellVariants = cva(`px-6 py-2 align-middle`);
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn(tableCellVariants(), className)} {...props} />
);
TableCell.displayName = 'TableCell';

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
