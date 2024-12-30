import { AnimatePresence } from 'motion/react';
import { DraggableTransformer } from './draggable-transformer';
import { TransformerWithParam } from '../types';

interface TransformerListProps {
  transformers: TransformerWithParam[];
  dragOverIndex: number | null;
  draggingItem: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrag: (e: any, info: any) => void;
  onRemove: (value: string) => void;
  onParamChange: (index: number, params: string[]) => void;
}

export function TransformerList({
  transformers,
  dragOverIndex,
  draggingItem,
  onDragStart,
  onDragEnd,
  onDrag,
  onRemove,
  onParamChange,
}: TransformerListProps) {
  if (transformers.length === 0) return null;

  return (
    <div className="rounded-8 border-stroke-soft flex flex-col gap-0.5 border px-1 py-1.5">
      <AnimatePresence mode="popLayout">
        {transformers.map((transformer, index) => (
          <DraggableTransformer
            key={transformer.value + index}
            transformer={transformer}
            index={index}
            isLast={index === transformers.length - 1}
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
