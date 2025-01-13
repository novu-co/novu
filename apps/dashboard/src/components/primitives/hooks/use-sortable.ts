import { useCallback, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

type DragInfo = {
  point: Point;
};

type UseSortableProps<T> = {
  items: T[];
  onUpdate: (items: T[]) => void;
};

type DragPosition = {
  index: number;
  isAfter: boolean;
};

export function useSortable<T>({ items, onUpdate }: UseSortableProps<T>) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      onUpdate(newItems);
    },
    [items, onUpdate]
  );

  const findDropPosition = useCallback(
    (point: Point): DragPosition | null => {
      const container = document.querySelector('[data-filters-container]');
      if (!container) return null;

      const containerRect = container.getBoundingClientRect();
      if (point.y < containerRect.top || point.y > containerRect.bottom) return null;

      const draggableElements = Array.from(container.querySelectorAll('[data-index]')) as HTMLElement[];
      if (draggableElements.length === 0) return null;

      // Constants for smoother detection
      const EDGE_THRESHOLD = 10; // px from top/bottom of element
      const TRANSITION_ZONE = 0.35; // percentage of element height for transition

      for (const element of draggableElements) {
        const rect = element.getBoundingClientRect();
        const index = parseInt(element.getAttribute('data-index') || '-1');
        if (index === -1) continue;

        // Skip if we're not within this element's vertical bounds
        if (point.y < rect.top - EDGE_THRESHOLD || point.y > rect.bottom + EDGE_THRESHOLD) continue;

        const elementHeight = rect.height;
        const transitionZoneSize = elementHeight * TRANSITION_ZONE;

        // Top zone
        if (point.y < rect.top + transitionZoneSize) {
          return { index, isAfter: false };
        }

        // Bottom zone
        if (point.y > rect.bottom - transitionZoneSize) {
          return { index, isAfter: true };
        }

        // Middle zone - maintain previous position to reduce flickering
        if (dragOverIndex !== null) {
          const currentIsAfter = dragOverIndex > index;
          return { index, isAfter: currentIsAfter };
        }

        // Default to after if we're in the middle and no previous position
        return { index, isAfter: true };
      }

      // Handle dropping at the end of the list
      const lastElement = draggableElements[draggableElements.length - 1];
      const lastRect = lastElement.getBoundingClientRect();

      if (point.y > lastRect.bottom - EDGE_THRESHOLD) {
        return { index: items.length - 1, isAfter: true };
      }

      return null;
    },
    [items.length, dragOverIndex]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggingItem(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragOverIndex !== null && draggingItem !== null) {
      moveItem(draggingItem, dragOverIndex);
    }
    setDraggingItem(null);
    setDragOverIndex(null);
  }, [dragOverIndex, draggingItem, moveItem]);

  const handleDrag = useCallback(
    (_: unknown, info: DragInfo) => {
      const position = findDropPosition(info.point);
      const newIndex = position ? (position.isAfter ? position.index + 1 : position.index) : null;

      if (newIndex !== dragOverIndex) {
        setDragOverIndex(newIndex);
      }
    },
    [dragOverIndex, findDropPosition]
  );

  return {
    dragOverIndex,
    draggingItem,
    handleDragStart,
    handleDragEnd,
    handleDrag,
  };
}
