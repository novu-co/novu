import { AnimatePresence } from 'motion/react';
import { FilterWithParam } from '../types';
import { DraggableFilter } from './draggable-filter';

type FiltersListProps = {
  filters: FilterWithParam[];
  dragOverIndex: number | null;
  draggingItem: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrag: (e: any, info: any) => void;
  onRemove: (value: string) => void;
  onParamChange: (index: number, params: string[]) => void;
};

export function FiltersList({
  filters,
  dragOverIndex,
  draggingItem,
  onDragStart,
  onDragEnd,
  onDrag,
  onRemove,
  onParamChange,
}: FiltersListProps) {
  if (filters.length === 0) return null;

  return (
    <div className="rounded-8 border-stroke-soft flex flex-col gap-0.5 border px-1 py-1.5" data-filters-container>
      <AnimatePresence mode="popLayout">
        {filters.map((filter, index) => (
          <DraggableFilter
            key={filter.value + index}
            filter={filter}
            index={index}
            isLast={index === filters.length - 1}
            dragOverIndex={dragOverIndex}
            draggingItem={draggingItem}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrag={onDrag}
            onRemove={onRemove}
            onParamChange={onParamChange}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
