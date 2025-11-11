import { useState, useMemo, useCallback } from 'react';

export interface FilterConfig<T = any> {
  key: keyof T;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean';
  label: string;
  options?: Array<{ value: any; label: string }>;
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export type FilterValues = Record<string, any>;

interface UseFiltersOptions<T> {
  data: T[];
  filters: FilterConfig<T>[];
  initialFilters?: FilterValues;
}

export function useFilters<T>({
  data,
  filters: filterConfigs,
  initialFilters = {},
}: UseFiltersOptions<T>) {
  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const updateFilter = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({});
    setSearchQuery('');
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilterValues((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Apply search query (searches all string values)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = Object.values(item as any).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
        if (!matchesSearch) return false;
      }

      // Apply all filter values
      for (const [key, value] of Object.entries(filterValues)) {
        if (value === undefined || value === null || value === '') continue;

        const filterConfig = filterConfigs.find((f) => f.key === key);
        if (!filterConfig) continue;

        const itemValue = (item as any)[key];

        switch (filterConfig.type) {
          case 'text':
            if (!String(itemValue).toLowerCase().includes(String(value).toLowerCase())) {
              return false;
            }
            break;

          case 'select':
            if (itemValue !== value) {
              return false;
            }
            break;

          case 'dateRange':
            const rangeValue = value as DateRangeFilter;
            if (rangeValue.startDate && itemValue < rangeValue.startDate) {
              return false;
            }
            if (rangeValue.endDate && itemValue > rangeValue.endDate) {
              return false;
            }
            break;

          case 'date':
            if (itemValue !== value) {
              return false;
            }
            break;

          case 'number':
            if (Number(itemValue) !== Number(value)) {
              return false;
            }
            break;

          case 'boolean':
            if (Boolean(itemValue) !== Boolean(value)) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }, [data, filterValues, searchQuery, filterConfigs]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filterValues).filter((v) => v !== undefined && v !== null && v !== '')
      .length;
  }, [filterValues]);

  return {
    filterValues,
    updateFilter,
    clearFilters,
    clearFilter,
    filteredData,
    searchQuery,
    setSearchQuery,
    activeFilterCount,
  };
}
