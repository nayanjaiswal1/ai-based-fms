import { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, accountsApi, categoriesApi, tagsApi, exportApi } from '@services/api';
import { Plus, Search, Filter, Download, Upload, Trash2, X, Copy, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import TransactionCards from '../components/TransactionCards';
import FilterModal from '../components/FilterModal';
import FileUploadModal from '../components/FileUploadModal';
import { InlineEditableTransactionTable } from '../components/InlineEditableTransactionTable';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@components/table';
import { VirtualTable } from '@/components/virtual';
import { getTransactionColumns } from '../config/transactionTable.config';
import { useUrlParams } from '@/hooks/useUrlParams';
import { toast } from 'react-hot-toast';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { UsageLimitBanner, ProtectedAction } from '@/components/feature-gate';
import { FeatureFlag } from '@/config/features.config';
import { StatusBar } from '@/components/ui/StatusBar';
import { useCurrency } from '@/hooks/useCurrency';
import { useTransactionNavigation } from '../hooks/useTransactionNavigation';
import { PageHeader } from '@/components/ui/PageHeader';

export default function TransactionsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [historyTransaction, setHistoryTransaction] = useState<any>(null);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { handleTransactionClick } = useTransactionNavigation();

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
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount', 'isVerified'];
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

  // Get duplicate count
  const { data: duplicatesData } = useQuery({
    queryKey: ['duplicates-count'],
    queryFn: () => transactionsApi.getAll({ isMerged: false }),
    staleTime: 60000, // Cache for 1 minute
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

  const unmergeMutation = useMutation({
    mutationFn: transactionsApi.unmergeTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['duplicates'] });
      toast.success('Transaction unmerged successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unmerge transaction');
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
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount', 'isVerified'];

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
    const filterKeys = ['type', 'accountId', 'categoryId', 'tagId', 'startDate', 'endDate', 'minAmount', 'maxAmount', 'isVerified'];
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

  const handleUnmerge = async (id: string) => {
    confirm({
      title: 'Unmerge Transaction',
      message: 'Are you sure you want to unmerge this transaction? It will be restored to your transaction list.',
      variant: 'warning',
      confirmLabel: 'Unmerge',
      onConfirm: async () => {
        await unmergeMutation.mutateAsync(id);
      },
    });
  };

  const handleHistory = (transaction: any) => {
    setHistoryTransaction(transaction);
  };

  const handleCloseHistory = () => {
    setHistoryTransaction(null);
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

  const handleExport = async (format: ExportFormat) => {
    try {
      const exportFilters = {
        ...filters,
        search: searchTerm || undefined,
      };

      let response;
      if (format === 'csv') {
        response = await exportApi.exportTransactionsCSV(exportFilters);
      } else if (format === 'excel') {
        response = await exportApi.exportTransactionsExcel(exportFilters);
      } else if (format === 'pdf') {
        response = await exportApi.exportTransactionsPDF(exportFilters);
      }

      // Download the file
      if (response) {
        const blob = new Blob([response as any], {
          type:
            format === 'csv'
              ? 'text/csv'
              : format === 'excel'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Transactions exported as ${format.toUpperCase()} successfully!`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export transactions');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.data?.find((c: any) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.data?.find((a: any) => a.id === accountId);
    return account?.name || 'Unknown';
  };

  const { formatLocale } = useCurrency();

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key] !== undefined && filters[key] !== ''
  ).length;

  // Calculate metrics for status bar
  const transactionData = transactions?.data || [];
  const totalIncome = transactionData
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalExpense = transactionData
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const netAmount = totalIncome - totalExpense;
  const unverifiedCount = transactionData.filter((t: any) => !t.isVerified).length;

  const statusBarItems = useMemo(() => [
    {
      id: 'count',
      label: 'Transactions',
      value: transactionData.length,
      icon: DollarSign,
      color: '#3b82f6',
      details: [
        { label: 'Total Transactions', value: transactionData.length },
        { label: 'Income Count', value: transactionData.filter((t: any) => t.type === 'income').length },
        { label: 'Expense Count', value: transactionData.filter((t: any) => t.type === 'expense').length },
        { label: 'Unverified', value: unverifiedCount },
      ],
    },
    {
      id: 'income',
      label: 'Income',
      value: formatLocale(totalIncome),
      icon: TrendingUp,
      color: '#10b981',
      details: [
        { label: 'Total Income', value: formatLocale(totalIncome) },
        { label: 'Average', value: transactionData.filter((t: any) => t.type === 'income').length > 0 ? formatLocale(totalIncome / transactionData.filter((t: any) => t.type === 'income').length) : formatLocale(0) },
      ],
    },
    {
      id: 'expense',
      label: 'Expense',
      value: formatLocale(totalExpense),
      icon: TrendingDown,
      color: '#ef4444',
      details: [
        { label: 'Total Expense', value: formatLocale(totalExpense) },
        { label: 'Average', value: transactionData.filter((t: any) => t.type === 'expense').length > 0 ? formatLocale(totalExpense / transactionData.filter((t: any) => t.type === 'expense').length) : formatLocale(0) },
      ],
    },
    {
      id: 'net',
      label: 'Net',
      value: formatLocale(Math.abs(netAmount)),
      icon: netAmount >= 0 ? TrendingUp : TrendingDown,
      color: netAmount >= 0 ? '#10b981' : '#ef4444',
      details: [
        { label: 'Net Amount', value: formatLocale(netAmount) },
        { label: 'Status', value: netAmount >= 0 ? 'Surplus' : 'Deficit' },
      ],
    },
  ], [transactionData, totalIncome, totalExpense, netAmount, unverifiedCount, formatLocale]);

  const columns = getTransactionColumns(
    getCategoryName,
    getAccountName,
    handleEdit,
    handleDelete,
    handleHistory,
    handleUnmerge
  );

  // Use virtual scrolling for large datasets (>100 items)
  const useVirtualScrolling = (transactions?.data?.length || 0) > 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Usage Limit Warning */}
      <UsageLimitBanner resource="maxTransactions" />

      {/* Page Header - Single Row */}
      <PageHeader
        showSearch={true}
        searchValue={searchTerm || ''}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search transactions..."
        showFilter={true}
        onFilterClick={handleOpenFilterModal}
        activeFiltersCount={activeFiltersCount}
        buttons={[
          {
            label: 'Add Transaction',
            icon: Plus,
            onClick: () => navigate('/transactions/new'),
            variant: 'primary' as const,
          },
        ]}
      />

      {/* Active Filters - Responsive */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
          {Object.entries(filters).map(([key, value]: [string, any]) => {
            if (!value) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-blue-800"
              >
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                </span>
                <button
                  onClick={() => handleRemoveFilter(key)}
                  className="hover:text-blue-900 flex-shrink-0"
                  aria-label={`Remove ${key} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <button
            onClick={handleClearAllFilters}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bulk Actions - Responsive */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 sm:px-4 py-3">
          <span className="text-xs sm:text-sm font-medium text-blue-900">
            {selectedIds.length} transaction(s) selected
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleBulkDelete}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Delete Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="flex-1 sm:flex-none rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Transactions - Switch between Inline Table (desktop) and Cards (mobile) */}
      {isMobile ? (
        <TransactionCards
          transactions={transactions?.data || []}
          getCategoryName={getCategoryName}
          getAccountName={getAccountName}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHistory={handleHistory}
          onUnmerge={handleUnmerge}
          onRowClick={(row) => handleTransactionClick(row.id, () => handleEdit(row))}
          selectable
          selectedIds={selectedIds}
          onSelectOne={handleSelectOne}
        />
      ) : (
        <InlineEditableTransactionTable
          transactions={transactions?.data || []}
          accounts={accounts?.data || []}
          categories={categories?.data || []}
          tags={tags?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isLoading}
        />
      )}

      {/* Modals */}
      <TransactionModal
        transaction={modalMode === 'edit' ? selectedTransactionData?.data : null}
        isOpen={!!modalMode}
        onClose={handleCloseModal}
        onImportClick={() => setIsFileUploadModalOpen(true)}
      />

      <FilterModal
        filters={filters}
        isOpen={filterMode === 'open'}
        onApply={handleApplyFilters}
        onClose={handleCloseFilterModal}
      />

      {historyTransaction && (
        <TransactionHistoryModal
          transaction={historyTransaction}
          isOpen={!!historyTransaction}
          onClose={handleCloseHistory}
        />
      )}

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />

      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
      />

      {/* Excel-style Status Bar */}
      {transactionData.length > 0 && <StatusBar items={statusBarItems} />}
    </div>
  );
}
