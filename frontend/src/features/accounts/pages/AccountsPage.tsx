import { useState } from 'react';
import { Plus, Edit, Trash2, Wallet, CreditCard, DollarSign, Banknote } from 'lucide-react';
import AccountModal from '../components/AccountModal';
import { useAccounts } from '../hooks/useAccounts';

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Use the clean hook - all API logic is abstracted away
  const { data: accounts, isLoading, delete: deleteAccount, isDeleting } = useAccounts();

  const handleEdit = (account: any) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      await deleteAccount(id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your financial accounts and track balances
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedAccount(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
        <p className="text-sm font-medium opacity-90">Total Balance</p>
        <p className="mt-2 text-4xl font-bold">${totalBalance.toFixed(2)}</p>
        <p className="mt-2 text-sm opacity-75">
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
            onClick={() => {
              setSelectedAccount(null);
              setIsModalOpen(true);
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts?.map((account: any) => {
            const Icon = getAccountIcon(account.type);
            const colorClass = getAccountTypeColor(account.type);

            return (
              <div
                key={account.id}
                className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-3 ${colorClass}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm capitalize text-gray-500">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${Number(account.balance).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Current Balance</p>
                </div>

                {account.description && (
                  <p className="mt-3 text-sm text-gray-600">{account.description}</p>
                )}

                {account.currency && account.currency !== 'USD' && (
                  <div className="mt-3 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {account.currency}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AccountModal
        account={selectedAccount}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccount(null);
        }}
      />
    </div>
  );
}
