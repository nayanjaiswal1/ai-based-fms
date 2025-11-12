import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Reusable hook for managing URL query parameters
 * Eliminates repetitive URLSearchParams code across components
 */
export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Get a single parameter value
   */
  const getParam = useCallback(
    (key: string, defaultValue?: string): string => {
      return searchParams.get(key) || defaultValue || '';
    },
    [searchParams]
  );

  /**
   * Get multiple parameters as an object
   * Useful for parsing filter parameters
   */
  const getParams = useCallback(
    (keys: string[]): Record<string, string> => {
      const params: Record<string, string> = {};
      keys.forEach((key) => {
        const value = searchParams.get(key);
        if (value) params[key] = value;
      });
      return params;
    },
    [searchParams]
  );

  /**
   * Set a single parameter
   * Preserves existing parameters by default
   */
  const setParam = useCallback(
    (key: string, value: string | null, options?: { replace?: boolean }) => {
      const params = options?.replace ? new URLSearchParams() : new URLSearchParams(searchParams);

      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Set multiple parameters at once
   * Preserves existing parameters by default
   * Can also remove specific keys before setting new values
   */
  const setParams = useCallback(
    (
      newParams: Record<string, string | null>,
      options?: { replace?: boolean; removeKeys?: string[] }
    ) => {
      const params = options?.replace ? new URLSearchParams() : new URLSearchParams(searchParams);

      // Remove specified keys first if provided
      if (options?.removeKeys) {
        options.removeKeys.forEach((key) => params.delete(key));
      }

      // Set new parameters
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Remove a single parameter
   */
  const removeParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams);
      params.delete(key);
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Remove multiple parameters
   */
  const removeParams = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams);
      keys.forEach((key) => params.delete(key));
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Clear all parameters
   */
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  /**
   * Get all parameters as a plain object
   */
  const allParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    getParam,
    getParams,
    setParam,
    setParams,
    removeParam,
    removeParams,
    clearParams,
    allParams,
    searchParams,
  };
}
