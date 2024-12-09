import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/primitives/button';

interface PaginationProps {
  offset: number;
  limit: number;
  hasMore: boolean;
  onOffsetChange: (newOffset: number) => void;
}

export function Pagination({ offset, limit, hasMore, onOffsetChange }: PaginationProps) {
  return (
    <div className="bottom-0 mt-auto border-t border-t-neutral-200 bg-white py-3">
      <div className="flex items-center justify-end px-6">
        <div className="border-input inline-flex items-center rounded-lg border bg-transparent">
          <Button
            variant="ghost"
            size="icon"
            disabled={offset === 0}
            onClick={() => onOffsetChange(0)}
            className="rounded-r-none border-0"
          >
            <div className="flex items-center">
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="-ml-2 h-4 w-4" />
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={offset === 0}
            onClick={() => onOffsetChange(Math.max(0, offset - limit))}
            className="border-l-input rounded-none border-0 border-l"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasMore}
            onClick={() => onOffsetChange(offset + limit)}
            className="border-l-input rounded-none border-0 border-l"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!hasMore}
            onClick={() => onOffsetChange(offset + limit * 5)}
            className="border-l-input rounded-l-none border-0 border-l"
          >
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="-ml-2 h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
