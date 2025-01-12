import { useCallback, useState } from 'react';
import { FILTERS } from '../constants';
import type { FilterWithParam } from '../types';

type UseFilterManagerProps = {
  initialFilters: FilterWithParam[];
  onUpdate: (filters: FilterWithParam[]) => void;
};

export function useFilterManager({ initialFilters, onUpdate }: UseFilterManagerProps) {
  const [filters, setFilters] = useState<FilterWithParam[]>(initialFilters.filter((t) => t.value !== 'default'));
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const handleFilterToggle = useCallback(
    (value: string) => {
      setFilters((current) => {
        const index = current.findIndex((t) => t.value === value);
        let newFilters: FilterWithParam[];

        if (index === -1) {
          const filterDef = FILTERS.find((t) => t.value === value);
          const newFilter: FilterWithParam = {
            value,
            ...(filterDef?.hasParam ? { params: filterDef.params?.map(() => '') } : {}),
          };

          newFilters = [...current, newFilter];
        } else {
          newFilters = current.filter((_, i) => i !== index);
        }

        onUpdate(newFilters);

        return newFilters;
      });
    },
    [onUpdate]
  );

  const moveFilter = useCallback(
    (fromIndex: number, toIndex: number) => {
      setFilters((current) => {
        const newFilters = [...current];
        const [movedItem] = newFilters.splice(fromIndex, 1);
        newFilters.splice(toIndex, 0, movedItem);

        onUpdate(newFilters);

        return newFilters;
      });
    },
    [onUpdate]
  );

  const handleParamChange = useCallback(
    (index: number, params: string[]) => {
      setFilters((current) => {
        const newFilters = [...current];
        const filterDef = FILTERS.find((def) => def.value === newFilters[index].value);

        // Format params based on their types
        const formattedParams = params.map((param, paramIndex) => {
          const paramType = filterDef?.params?.[paramIndex]?.type;

          if (paramType === 'number') {
            const numericValue = String(param).replace(/[^\d.-]/g, '');
            return isNaN(Number(numericValue)) ? '' : numericValue;
          }
          return param;
        });

        newFilters[index] = { ...newFilters[index], params: formattedParams };
        onUpdate(newFilters);

        return newFilters;
      });
    },
    [onUpdate]
  );

  const getFilteredFilters = useCallback(
    (query: string) => {
      const normalizedQuery = query.toLowerCase();
      return FILTERS.filter((filter) => {
        // Never show default in the transformer list as it's handled separately
        if (filter.value === 'default') return false;
        if (filters.some((t) => t.value === filter.value)) return false;

        return (
          filter.label.toLowerCase().includes(normalizedQuery) ||
          filter.description?.toLowerCase().includes(normalizedQuery) ||
          filter.value.toLowerCase().includes(normalizedQuery)
        );
      });
    },
    [filters]
  );

  return {
    filters,
    dragOverIndex,
    draggingItem,
    setDragOverIndex,
    setDraggingItem,
    handleFilterToggle,
    moveFilter,
    handleParamChange,
    getFilteredFilters,
  };
}
