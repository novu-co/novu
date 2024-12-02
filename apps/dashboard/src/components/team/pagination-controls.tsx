import { Button } from '@/components/primitives/button';
import { PaginationControlsProps } from './types';

export function PaginationControls({
  hasPreviousPage,
  hasNextPage,
  isFetching,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button variant="outline" disabled={!hasPreviousPage || isFetching} onClick={onPrevious}>
        Previous
      </Button>
      <Button variant="outline" disabled={!hasNextPage || isFetching} onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
