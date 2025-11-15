import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Wallet, CreditCard, DollarSign, Banknote, CheckCircle, Clock, GitCompare, LayoutGrid, Layers, TrendingUp } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AccountModal from '../components/AccountModal';
import { AccountCardsView } from '../components/AccountCardsView';
import { useAccounts } from '../hooks/useAccounts';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useConfirm } from '@hooks/useConfirm';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, exportApi } from '@services/api';
import { toast } from 'react-hot-toast';
import { UsageLimitBanner, ProtectedAction } from '@/components/feature-gate';
import { FeatureFlag } from '@/config/features.config';
import { StatusBar } from '@/components/ui/StatusBar';
import { useCurrency } from '@/hooks/useCurrency';
import { PageHeader } from '@/components/ui/PageHeader';

type ViewMode = 'grid' | 'cards';
type ExportFormat = 'csv' | 'pdf';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { symbol } = useCurrency();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/accounts/new';
  const isEditModal = location.pathname.startsWith('/accounts/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const accountId = id;

  // Use the clean hook - all API logic is abstracted away
  const { data: allAccounts, isLoading, delete: deleteAccount, isDeleting } = useAccounts();

  // Filter accounts based on search and filters
  const accounts = useMemo(() => {
    if (!allAccounts) return allAccounts;

    let filtered = allAccounts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((acc: any) =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((acc: any) => acc.type === typeFilter);
    }

    return filtered;
  }, [allAccounts, searchTerm, typeFilter]);

  // Fetch selected account for edit mode
  const { data: selectedAccountData } = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => accountsApi.getById(accountId!),
    enabled: !!accountId && modalMode === 'edit',
  });

  // Confirmation dialog hook
  const { confirmState, confirm, closeConfirm } = useConfirm();

  const handleEdit = (account: any) => {
    navigate(`/accounts/edit/${account.id}`);
  };

  const handleCloseModal = () => {
    navigate('/accounts');
  };

  const handleDelete = (id: string, accountName: string) => {
    confirm({
      title: 'Delete Account',
      message: `Are you sure you want to delete "${accountName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteAccount(id);
      },
    });
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      let response;
      if (format === 'csv') {
        response = await exportApi.exportAccountsCSV();
      } else if (format === 'pdf') {
        response = await exportApi.exportAccountsPDF();
      }

      // Download the file
      if (response) {
        const blob = new Blob([response as any], {
          type: format === 'csv' ? 'text/csv' : 'application/pdf',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accounts_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Accounts exported as ${format.toUpperCase()} successfully!`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export accounts');
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return Banknote;
      case 'card':
        return CreditCard;
      case 'wallet':
        return Wallet;
      case 'cash':
        return DollarSign;
      default:
        return Wallet;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'bank':
        return 'bg-blue-500';
      case 'card':
        return 'bg-purple-500';
      case 'wallet':
        return 'bg-green-500';
      case 'cash':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const { formatLocale } = useCurrency();

  const totalBalance = accounts?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;
  const reconciledCount = accounts?.filter((acc: any) => acc.reconciliationStatus === 'reconciled').length || 0;
  const inProgressCount = accounts?.filter((acc: any) => acc.reconciliationStatus === 'in_progress').length || 0;

  const statusBarItems = useMemo(() => [
    {
      id: 'total',
      label: 'Total Balance',
      value: formatLocale(totalBalance),
      icon: TrendingUp,
      color: '#10b981',
      details: [
        { label: 'Total Balance', value: formatLocale(totalBalance) },
        { label: 'Total Accounts', value: accounts?.length || 0 },
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      value: accounts?.length || 0,
      icon: Wallet,
      color: '#3b82f6',
      details: [
        { label: 'Bank Accounts', value: accounts?.filter((a: any) => a.type === 'bank').length || 0 },
        { label: 'Cards', value: accounts?.filter((a: any) => a.type === 'card').length || 0 },
        { label: 'Wallets', value: accounts?.filter((a: any) => a.type === 'wallet').length || 0 },
        { label: 'Cash', value: accounts?.filter((a: any) => a.type === 'cash').length || 0 },
      ],
    },
    {
      id: 'reconciled',
      label: 'Reconciled',
      value: reconciledCount,
      icon: CheckCircle,
      color: '#10b981',
      details: [
        { label: 'Reconciled', value: reconciledCount },
        { label: 'In Progress', value: inProgressCount },
        { label: 'Not Reconciled', value: (accounts?.length || 0) - reconciledCount - inProgressCount },
      ],
    },
  ], [totalBalance, accounts, reconciledCount, inProgressCount, formatLocale]);

  const getReconciliationBadge = (status: string, lastReconciledAt?: string) => {
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    if (status === 'reconciled' && lastReconciledAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Reconciled
        </span>
      );
    }
    return null;
  };

  const handleReconcile = (account: any) => {
    navigate(`/reconciliation?accountId=${account.id}&accountName=${encodeURIComponent(account.name)}`);
  };

  const activeFiltersCount = typeFilter ? 1 : 0;

  return (
    <div className={viewMode === 'cards' ? '' : 'space-y-4 sm:space-y-6'}>
      {/* Only show header and banner in grid view */}
      {viewMode === 'grid' && (
        <>
          {/* Usage Limit Warning */}
          <UsageLimitBanner resource="maxAccounts" />

          {/* Page Header */}
          <PageHeader
            showSearch={true}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search accounts..."
            showFilter={true}
            onFilterClick={() => setShowFilters(!showFilters)}
            activeFiltersCount={activeFiltersCount}
            buttons={[
              ...(accounts && accounts.length > 0
                ? [
                    {
                      label: 'Grid',
                      icon: LayoutGrid,
                      onClick: () => setViewMode('grid'),
                      variant: viewMode === 'grid' ? 'primary' : ('outline' as const),
                      className: 'hidden sm:flex',
                    },
                    {
                      label: 'Cards',
                      icon: Layers,
                      onClick: () => setViewMode('cards'),
                      variant: viewMode === 'cards' ? 'primary' : ('outline' as const),
                      className: 'hidden sm:flex',
                    },
                  ]
                : []),
              {
                label: 'Add Account',
                icon: Plus,
                onClick: () => navigate('/accounts/new'),
                variant: 'primary' as const,
              },
            ]}
          />

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="bank">Bank</option>
                    <option value="card">Card</option>
                    <option value="wallet">Wallet</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-end gap-2">
                  <button
                    onClick={() => {
                      setTypeFilter('');
                      setSearchTerm('');
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* View toggle for cards view */}
      {viewMode === 'cards' && accounts && accounts.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
              aria-label="Cards view"
            >
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      )}

      {/* Accounts Views */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">Loading accounts...</p>
        </div>
      ) : accounts?.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Wallet className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No accounts yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first account
          </p>
          <button
            onClick={() => navigate('/accounts/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Account
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <AccountCardsView
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReconcile={handleReconcile}
          getAccountIcon={getAccountIcon}
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account: any) => {
            const Icon = getAccountIcon(account.type);
            const colorClass = getAccountTypeColor(account.type);

            return (
              <div
                key={account.id}
                className="rounded-lg bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`rounded-lg p-2 sm:p-3 flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {account.name}
                      </h3>
                      <p className="text-xs sm:text-sm capitalize text-gray-500">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(account)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      aria-label="Edit account"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id, account.name)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete account"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {symbol()}{Number(account.balance).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Current Balance</p>
                </div>

                {account.description && (
                  <p className="mt-3 text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {account.description}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {account.currency && account.currency !== 'USD' && (
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {account.currency}
                      </span>
                    )}
                    {getReconciliationBadge(account.reconciliationStatus, account.lastReconciledAt)}
                  </div>
                  <button
                    onClick={() => handleReconcile(account)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <GitCompare className="w-3 h-3" />
                    Reconcile
                  </button>
                </div>

                {account.lastReconciledAt && (
                  <p className="mt-2 text-xs text-gray-500">
                    Last reconciled: {new Date(account.lastReconciledAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AccountModal
        account={modalMode === 'edit' ? selectedAccountData?.data : null}
        isOpen={!!modalMode}
        onClose={handleCloseModal}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        {...confirmState}
        onClose={closeConfirm}
        isLoading={isDeleting}
      />

      {/* Excel-style Status Bar */}
      {accounts && accounts.length > 0 && <StatusBar items={statusBarItems} />}
    </div>
  );
}
