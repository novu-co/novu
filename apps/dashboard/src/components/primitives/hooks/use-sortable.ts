import { useCallback, useState } from 'react';

type UseSortableProps<T> = {
  items: T[];
  onUpdate: (items: T[]) => void;
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
    (_: any, info: any) => {
      const elements = document.elementsFromPoint(info.point.x, info.point.y);
      const droppableElement = elements.find(
        (el) => el.classList.contains('group') && !el.classList.contains('opacity-50')
      );

      if (droppableElement) {
        const index = parseInt(droppableElement.getAttribute('data-index') || '-1');
        if (index !== -1 && dragOverIndex !== index) {
          setDragOverIndex(index);
        }
      } else {
        setDragOverIndex(null);
      }
    },
    [dragOverIndex]
  );

  return {
    dragOverIndex,
    draggingItem,
    handleDragStart,
    handleDragEnd,
    handleDrag,
  };
}
