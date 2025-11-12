import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, accountsApi, categoriesApi, tagsApi } from '@services/api';
import { Plus, Search, Filter, Download, Upload, Trash2, X } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import FilterModal from '../components/FilterModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@components/table';
import { getTransactionColumns } from '../config/transactionTable.config';
import { useUrlParams } from '@/hooks/useUrlParams';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Use the new useUrlParams hook for query parameters
  const { getParam, getParams, setParam, setParams, removeParam, removeParams } = useUrlParams();

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/transactions/new';
  const isEditModal = location.pathname.startsWith('/transactions/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const transactionId = id;

  const filterMode = getParam('filter'); // 'open' to show filters
  const searchTerm = getParam('search');

  // Parse filters from URL using the hook
  const filters = useMemo(() => {
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount'];
    return getParams(filterKeys);
  }, [getParams]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', filters, searchTerm],
    queryFn: () =>
      transactionsApi.getAll({
        ...filters,
        search: searchTerm || undefined,
      }),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Fetch selected transaction for edit mode
  const { data: selectedTransactionData } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionsApi.getById(transactionId!),
    enabled: !!transactionId && modalMode === 'edit',
  });

  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: transactionsApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setSelectedIds([]);
    },
  });

  const handleEdit = (transaction: any) => {
    navigate(`/transactions/edit/${transaction.id}`);
  };

  const handleCloseModal = () => {
    navigate('/transactions' + (location.search || ''));
  };

  const handleOpenFilterModal = () => {
    setParam('filter', 'open');
  };

  const handleCloseFilterModal = () => {
    removeParam('filter');
  };

  const handleApplyFilters = (newFilters: any) => {
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount'];

    // Convert filters to the right format
    const cleanedFilters: Record<string, string | null> = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      cleanedFilters[key] = value ? String(value) : null;
    });

    // Set all new filters and remove 'filter' modal param and old filter keys in one operation
    setParams(cleanedFilters, { removeKeys: ['filter', ...filterKeys] });
  };

  const handleSearchChange = (value: string) => {
    setParam('search', value || null);
  };

  const handleRemoveFilter = (key: string) => {
    removeParam(key);
  };

  const handleClearAllFilters = () => {
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount'];
    removeParams(filterKeys);
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const handleBulkDelete = async () => {
    confirm({
      title: 'Delete Transactions',
      message: `Are you sure you want to delete ${selectedIds.length} transactions? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await bulkDeleteMutation.mutateAsync(selectedIds);
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === transactions?.data?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions?.data?.map((t: any) => t.id) || []);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.data?.find((c: any) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.data?.find((a: any) => a.id === accountId);
    return account?.name || 'Unknown';
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key] !== undefined && filters[key] !== ''
  ).length;

  const columns = getTransactionColumns(
    getCategoryName,
    getAccountName,
    handleEdit,
    handleDelete
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => navigate('/transactions/new')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleOpenFilterModal}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(filters).map(([key, value]: [string, any]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                <button
                  onClick={() => handleRemoveFilter(key)}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={handleClearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} transaction(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions?.data || []}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage="No transactions found. Add your first transaction to get started."
        selectable
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
      />

      {/* Modals */}
      <TransactionModal
        transaction={modalMode === 'edit' ? selectedTransactionData?.data : null}
        isOpen={!!modalMode}
        onClose={handleCloseModal}
      />

      <FilterModal
        filters={filters}
        isOpen={filterMode === 'open'}
        onApply={handleApplyFilters}
        onClose={handleCloseFilterModal}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
