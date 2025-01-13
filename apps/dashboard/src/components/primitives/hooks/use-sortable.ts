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
      const elements = document.elementsFromPoint(point.x, point.y);
      const droppableElement = elements.find(
        (el) => el.classList.contains('group') && !el.classList.contains('opacity-50')
      );

      if (droppableElement) {
        const index = parseInt(droppableElement.getAttribute('data-index') || '-1');
        return index !== -1 ? { index, isAfter: false } : null;
      }

      const container = document.querySelector('.rounded-8.border-stroke-soft');
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const isInBounds = point.x >= rect.left && point.x <= rect.right && point.y >= rect.top;

      const isBelow = point.y > rect.bottom - 20; // 20px threshold

      if (isInBounds && isBelow) {
        return { index: items.length - 1, isAfter: true };
      }

      return null;
    },
    [items.length]
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
