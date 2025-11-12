import { useState, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useWidgetPreferences } from './useWidgetPreferences';

export function useDashboardLayout() {
  const { widgets, visibleWidgets, reorderWidgets, isUpdating } = useWidgetPreferences();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setIsDragging(false);

      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
      const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWidgets(oldIndex, newIndex);
      }
    },
    [visibleWidgets, reorderWidgets]
  );

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    widgets,
    visibleWidgets,
    isDragging,
    isUpdating,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
