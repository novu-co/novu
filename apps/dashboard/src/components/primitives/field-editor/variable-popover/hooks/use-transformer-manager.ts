import { useCallback, useState } from 'react';
import { TRANSFORMERS } from '../constants';
import type { TransformerWithParam } from '../types';

type UseTransformerManagerProps = {
  initialTransformers: TransformerWithParam[];
  onUpdate: (transformers: TransformerWithParam[]) => void;
};

export function useTransformerManager({ initialTransformers, onUpdate }: UseTransformerManagerProps) {
  const [transformers, setTransformers] = useState<TransformerWithParam[]>(
    initialTransformers.filter((t) => t.value !== 'default')
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const handleTransformerToggle = useCallback(
    (value: string) => {
      setTransformers((current) => {
        const index = current.findIndex((t) => t.value === value);
        let newTransformers: TransformerWithParam[];

        if (index === -1) {
          const transformerDef = TRANSFORMERS.find((t) => t.value === value);
          const newTransformer: TransformerWithParam = {
            value,
            ...(transformerDef?.hasParam ? { params: transformerDef.params?.map(() => '') } : {}),
          };

          newTransformers = [...current, newTransformer];
        } else {
          newTransformers = current.filter((_, i) => i !== index);
        }

        onUpdate(newTransformers);

        return newTransformers;
      });
    },
    [onUpdate]
  );

  const moveTransformer = useCallback(
    (fromIndex: number, toIndex: number) => {
      setTransformers((current) => {
        const newTransformers = [...current];
        const [movedItem] = newTransformers.splice(fromIndex, 1);
        newTransformers.splice(toIndex, 0, movedItem);

        onUpdate(newTransformers);

        return newTransformers;
      });
    },
    [onUpdate]
  );

  const handleParamChange = useCallback(
    (index: number, params: string[]) => {
      setTransformers((current) => {
        const newTransformers = [...current];
        const transformerDef = TRANSFORMERS.find((def) => def.value === newTransformers[index].value);

        // Format params based on their types
        const formattedParams = params.map((param, paramIndex) => {
          const paramType = transformerDef?.params?.[paramIndex]?.type;

          if (paramType === 'number') {
            const numericValue = String(param).replace(/[^\d.-]/g, '');
            return isNaN(Number(numericValue)) ? '' : numericValue;
          }
          return param;
        });

        newTransformers[index] = { ...newTransformers[index], params: formattedParams };
        onUpdate(newTransformers);

        return newTransformers;
      });
    },
    [onUpdate]
  );

  const getFilteredTransformers = useCallback(
    (query: string) => {
      const normalizedQuery = query.toLowerCase();
      return TRANSFORMERS.filter((transformer) => {
        // Never show default in the transformer list as it's handled separately
        if (transformer.value === 'default') return false;
        if (transformers.some((t) => t.value === transformer.value)) return false;

        return (
          transformer.label.toLowerCase().includes(normalizedQuery) ||
          transformer.description?.toLowerCase().includes(normalizedQuery) ||
          transformer.value.toLowerCase().includes(normalizedQuery)
        );
      });
    },
    [transformers]
  );

  return {
    transformers,
    dragOverIndex,
    draggingItem,
    setDragOverIndex,
    setDraggingItem,
    handleTransformerToggle,
    moveTransformer,
    handleParamChange,
    getFilteredTransformers,
  };
}
