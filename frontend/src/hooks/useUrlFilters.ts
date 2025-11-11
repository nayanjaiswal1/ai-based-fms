import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Generic hook for managing filters through URL search params
 * Makes filters bookmarkable and shareable across all pages
 * Uses standard react-router-dom useSearchParams hook
 */
export function useUrlFilters<T extends Record<string, unknown>>() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse all URL params into typed filters object
  const filters = useMemo((): Partial<T> => {
    const params: Record<string, unknown> = {};

    searchParams.forEach((value, key) => {
      // Try to parse JSON for arrays/objects
      try {
        params[key] = JSON.parse(value);
      } catch {
        // Handle special cases
        if (value === 'true') params[key] = true;
        else if (value === 'false') params[key] = false;
        else if (!isNaN(Number(value)) && value !== '') params[key] = Number(value);
        else params[key] = value;
      }
    });

    return params as Partial<T>;
  }, [searchParams]);

  // Update single filter
  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K] | null | undefined) => {
      const newParams = new URLSearchParams(searchParams);

      if (value === null || value === undefined || value === '') {
        newParams.delete(String(key));
      } else {
        const serialized =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        newParams.set(String(key), serialized);
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Update multiple filters
  const setFilters = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          newParams.delete(key);
        } else {
          const serialized =
            typeof value === 'object' ? JSON.stringify(value) : String(value);
          newParams.set(key, serialized);
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Clear single filter
  const clearFilter = useCallback(
    <K extends keyof T>(key: K) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete(String(key));
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Check if filters are active
  const hasFilters = useMemo(() => searchParams.toString().length > 0, [searchParams]);

  // Get filter count
  const filterCount = useMemo(() => Array.from(searchParams.keys()).length, [searchParams]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilter,
    clearFilters,
    hasFilters,
    filterCount,
  };
}
