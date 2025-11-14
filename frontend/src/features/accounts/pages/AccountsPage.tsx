import { Plus, Edit, Trash2, Wallet, CreditCard, DollarSign, Banknote, CheckCircle, Clock, GitCompare } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AccountModal from '../components/AccountModal';
import { useAccounts } from '../hooks/useAccounts';
import { ConfirmDialog } from '@components/ui/ConfirmDialog';
import { useConfirm } from '@hooks/useConfirm';
import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@services/api';
import { toast } from 'react-hot-toast';
import { UsageLimitBanner, ProtectedAction } from '@/components/feature-gate';
import { FeatureFlag } from '@/config/features.config';

export default function AccountsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/accounts/new';
  const isEditModal = location.pathname.startsWith('/accounts/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const accountId = id;

  // Use the clean hook - all API logic is abstracted away
  const { data: accounts, isLoading, delete: deleteAccount, isDeleting } = useAccounts();

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

  const totalBalance = accounts?.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0) || 0;

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Usage Limit Warning */}
      <UsageLimitBanner resource="maxAccounts" />

      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Manage your financial accounts and track balances
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/accounts/new')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card - Responsive */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-6 text-white shadow-lg">
        <p className="text-xs sm:text-sm font-medium opacity-90">Total Balance</p>
        <p className="mt-2 text-3xl sm:text-4xl font-bold">${totalBalance.toFixed(2)}</p>
        <p className="mt-2 text-xs sm:text-sm opacity-75">
          Across {accounts?.length || 0} account(s)
        </p>
      </div>

      {/* Accounts Grid */}
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
                    ${Number(account.balance).toFixed(2)}
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
    </div>
  );
}
