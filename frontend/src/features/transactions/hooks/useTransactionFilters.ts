import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface TransactionFilters {
  type?: 'income' | 'expense';
  accountId?: string;
  categoryId?: string;
  tagIds?: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

/**
 * Hook for managing transaction filters through URL
 * Makes filters bookmarkable and shareable
 */
export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo((): TransactionFilters => {
    const params: TransactionFilters = {};

    if (searchParams.has('type')) params.type = searchParams.get('type') as any;
    if (searchParams.has('accountId')) params.accountId = searchParams.get('accountId') || undefined;
    if (searchParams.has('categoryId')) params.categoryId = searchParams.get('categoryId') || undefined;
    if (searchParams.has('tagIds')) {
      try {
        params.tagIds = JSON.parse(searchParams.get('tagIds') || '[]');
      } catch {
        params.tagIds = [];
      }
    }
    if (searchParams.has('startDate')) params.startDate = searchParams.get('startDate') || undefined;
    if (searchParams.has('endDate')) params.endDate = searchParams.get('endDate') || undefined;
    if (searchParams.has('minAmount')) params.minAmount = parseFloat(searchParams.get('minAmount') || '0') || undefined;
    if (searchParams.has('maxAmount')) params.maxAmount = parseFloat(searchParams.get('maxAmount') || '0') || undefined;
    if (searchParams.has('search')) params.search = searchParams.get('search') || undefined;

    return params;
  }, [searchParams]);

  const setFilters = useCallback((updates: Partial<TransactionFilters>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        newParams.delete(key);
      } else {
        const serialized = Array.isArray(value) ? JSON.stringify(value) : String(value);
        newParams.set(key, serialized);
      }
    });

    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const hasFilters = useMemo(() => {
    return searchParams.toString().length > 0;
  }, [searchParams]);

  return { filters, setFilters, clearFilters, hasFilters };
}
