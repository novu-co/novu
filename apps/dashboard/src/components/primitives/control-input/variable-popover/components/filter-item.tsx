import TruncatedText from '@/components/truncated-text';
import { Filters } from '../types';

type FilterItemProps = {
  filter: Filters;
};

export function FilterItem({ filter }: FilterItemProps) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium">{filter.label}</span>
        </div>
        <p className="text-text-sub truncate text-[11px]">{filter.description}</p>

        {filter.example && (
          <TruncatedText asChild>
            <span className="text-text-sub line-clamp-2 max-w-[290px] break-all font-mono text-[10px]">
              {filter.example}
            </span>
          </TruncatedText>
        )}
      </div>
    </div>
  );
}
