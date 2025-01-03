import { useCallback, useState } from 'react';
import { TRANSFORMERS } from '../constants';
import { TransformerWithParam } from '../types';

interface UseTransformerManagerProps {
  initialTransformers: TransformerWithParam[];
  onUpdate: (transformers: TransformerWithParam[]) => void;
}

export function useTransformerManager({ initialTransformers, onUpdate }: UseTransformerManagerProps) {
  const [transformers, setTransformers] = useState<TransformerWithParam[]>(initialTransformers);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const handleTransformerToggle = useCallback(
    (value: string) => {
      setTransformers((current) => {
        const newTransformers = current.some((t) => t.value === value)
          ? current.filter((t) => t.value !== value)
          : [...current, { value }];
        onUpdate(newTransformers);
        return newTransformers;
      });
    },
    [onUpdate]
  );

  const moveTransformer = useCallback(
    (from: number, to: number) => {
      setTransformers((current) => {
        const newTransformers = [...current];
        const [removed] = newTransformers.splice(from, 1);
        newTransformers.splice(to, 0, removed);
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
