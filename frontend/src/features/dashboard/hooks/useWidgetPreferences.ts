import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardPreferencesApi, UpdatePreferencesDto, WidgetConfig } from '../api/dashboard-preferences.api';
import { toast } from 'react-hot-toast';
import { useCallback, useEffect } from 'react';

const PREFERENCES_KEY = 'dashboard-preferences';
const LOCAL_STORAGE_KEY = 'dashboard-preferences-cache';

export function useWidgetPreferences() {
  const queryClient = useQueryClient();

  // Load preferences from backend
  const { data: preferences, isLoading, error } = useQuery({
    queryKey: [PREFERENCES_KEY],
    queryFn: () => dashboardPreferencesApi.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save to localStorage on load
  useEffect(() => {
    if (preferences) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [preferences]);

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (dto: UpdatePreferencesDto) => dashboardPreferencesApi.updatePreferences(dto),
    onMutate: async (newPreferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [PREFERENCES_KEY] });

      // Snapshot previous value
      const previousPreferences = queryClient.getQueryData([PREFERENCES_KEY]);

      // Optimistically update - merge widgets into existing preferences
      queryClient.setQueryData([PREFERENCES_KEY], (old: any) => {
        const oldData = old?.data || old;
        return {
          ...oldData,
          widgets: newPreferences.widgets,
          gridColumns: newPreferences.gridColumns ?? oldData?.gridColumns ?? 3,
        };
      });

      // Also update localStorage
      const currentCache = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (currentCache) {
        const parsed = JSON.parse(currentCache);
        const parsedData = parsed?.data || parsed;
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            ...parsedData,
            widgets: newPreferences.widgets,
            gridColumns: newPreferences.gridColumns ?? parsedData?.gridColumns ?? 3,
          })
        );
      }

      return { previousPreferences };
    },
    onError: (err, newPreferences, context) => {
      // Rollback on error
      if (context?.previousPreferences) {
        queryClient.setQueryData([PREFERENCES_KEY], context.previousPreferences);
      }
      toast.error('Failed to save dashboard preferences');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREFERENCES_KEY] });
    },
  });

  // Reset to default mutation
  const resetMutation = useMutation({
    mutationFn: () => dashboardPreferencesApi.resetToDefault(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREFERENCES_KEY] });
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      toast.success('Dashboard reset to default layout');
    },
    onError: () => {
      toast.error('Failed to reset dashboard');
    },
  });

  const updateWidgets = useCallback(
    (widgets: WidgetConfig[]) => {
      updateMutation.mutate({ widgets });
    },
    [updateMutation]
  );

  const getWidgets = useCallback(() => {
    const preferencesData = preferences?.data || preferences;
    return Array.isArray(preferencesData?.widgets) ? preferencesData.widgets : [];
  }, [preferences]);

  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      const currentWidgets = getWidgets();
      const updatedWidgets = currentWidgets.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );

      updateMutation.mutate({ widgets: updatedWidgets });
    },
    [getWidgets, updateMutation]
  );

  const addWidget = useCallback(
    (widget: WidgetConfig) => {
      const currentWidgets = getWidgets();
      const updatedWidgets = [...currentWidgets, widget];
      updateMutation.mutate({ widgets: updatedWidgets });
    },
    [getWidgets, updateMutation]
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      const currentWidgets = getWidgets();
      const updatedWidgets = currentWidgets.filter((w) => w.id !== widgetId);
      updateMutation.mutate({ widgets: updatedWidgets });
    },
    [getWidgets, updateMutation]
  );

  const toggleWidgetVisibility = useCallback(
    (widgetId: string) => {
      const currentWidgets = getWidgets();
      const updatedWidgets = currentWidgets.map((widget) =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      );

      updateMutation.mutate({ widgets: updatedWidgets });
    },
    [getWidgets, updateMutation]
  );

  const reorderWidgets = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      const currentWidgets = getWidgets();
      const widgets = [...currentWidgets];
      const [removed] = widgets.splice(sourceIndex, 1);
      widgets.splice(destinationIndex, 0, removed);

      // Update positions
      const reorderedWidgets = widgets.map((widget, index) => ({
        ...widget,
        position: index,
      }));

      updateMutation.mutate({ widgets: reorderedWidgets });
    },
    [getWidgets, updateMutation]
  );

  const resetToDefault = useCallback(() => {
    resetMutation.mutate();
  }, [resetMutation]);

  // Extract widgets array - handle both direct and nested data structures
  const preferencesData = preferences?.data || preferences;
  const widgetsArray = Array.isArray(preferencesData?.widgets) ? preferencesData.widgets : [];

  return {
    preferences: preferencesData,
    widgets: widgetsArray,
    visibleWidgets: widgetsArray.filter((w) => w.visible),
    isLoading,
    error,
    updateWidgets,
    updateWidget,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
    reorderWidgets,
    resetToDefault,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,
  };
}
