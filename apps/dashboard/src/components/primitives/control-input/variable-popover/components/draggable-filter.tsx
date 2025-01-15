import { Button } from '@/components/primitives/button';
import { InputPure } from '@/components/primitives/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { GripVertical } from 'lucide-react';
import { motion } from 'motion/react';
import { forwardRef } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { FILTERS } from '../constants';
import { FilterWithParam } from '../types';

type DraggableFilterProps = {
  filter: FilterWithParam;
  index: number;
  isLast: boolean;
  draggingItem: number | null;
  dragOverIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDrag: (e: any, info: any) => void;
  onRemove: (value: string) => void;
  onParamChange: (index: number, params: string[]) => void;
};

export const DraggableFilter = forwardRef<HTMLDivElement, DraggableFilterProps>(
  (
    { filter, index, isLast, draggingItem, dragOverIndex, onDragStart, onDragEnd, onDrag, onRemove, onParamChange },
    ref
  ) => {
    const filterDef = FILTERS.find((t) => t.value === filter.value);
    const isDragging = draggingItem === index;

    return (
      <motion.div ref={ref} key={filter.value + index} className="relative" initial={false}>
        {dragOverIndex === index && (
          <motion.div
            layoutId="dropIndicator"
            className="absolute -top-0.5 left-0 right-0 h-0.5 bg-neutral-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        <motion.div
          className={`group mb-0 flex cursor-move items-center gap-1.5 rounded-md p-0.5 ${
            isDragging ? 'opacity-50' : ''
          }`}
          drag="y"
          dragDirectionLock
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          dragSnapToOrigin={false}
          onDragStart={() => onDragStart(index)}
          onDragEnd={onDragEnd}
          onDrag={onDrag}
          data-index={index}
          animate={isDragging ? { scale: 1.02, zIndex: 50 } : { scale: 1, zIndex: 1 }}
          transition={{
            duration: 0.15,
            ease: [0.32, 0.72, 0, 1],
          }}
        >
          <GripVertical className="text-text-soft h-3.5 w-3.5" />
          <div className="flex flex-1 items-center gap-1">
            <div className="border-stroke-soft text-text-sub text-paragraph-xs bg-bg-weak rounded-8 flex w-full flex-row items-center border">
              <Tooltip delayDuration={700}>
                <TooltipTrigger asChild>
                  <div className="cursor-help px-2 py-1.5 pr-0">{filterDef?.label}</div>
                </TooltipTrigger>
                <TooltipContent side="left" align="center" className="font-mono text-[10px]">
                  {filterDef?.example}
                </TooltipContent>
              </Tooltip>
              {filterDef?.hasParam && filterDef.params && (
                <div className="flex flex-1 flex-col gap-1 py-1">
                  {filterDef.params.map((param, paramIndex) => (
                    <InputPure
                      key={paramIndex}
                      value={filter.params?.[paramIndex] || ''}
                      onChange={(e) => {
                        const newParams = [...(filter.params || [])];
                        newParams[paramIndex] = e.target.value;
                        onParamChange(index, newParams);
                      }}
                      className="border-stroke-soft ml-1 h-[20px] w-[calc(100%-8px)] border-l pl-1 text-xs"
                      placeholder={param.placeholder}
                      title={param.description}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            mode="ghost"
            size="sm"
            className="text-text-soft hover:text-destructive h-4 w-4 p-0"
            onClick={() => onRemove(filter.value)}
          >
            <RiCloseLine className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
        {isLast && dragOverIndex === index + 1 && (
          <motion.div
            layoutId="dropIndicator"
            className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-neutral-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  }
);
