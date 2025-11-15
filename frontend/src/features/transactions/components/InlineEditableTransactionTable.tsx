import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { transactionsApi } from '@services/api';
import { InlineEditableCell } from './InlineEditableCell';
import { toast } from 'react-hot-toast';

interface InlineEditableTransactionTableProps {
  transactions: any[];
  accounts: any[];
  categories: any[];
  tags: any[];
  onEdit: (transaction: any) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

interface EditingCell {
  rowId: string;
  field: string;
}

interface NewTransaction {
  date: string;
  description: string;
  amount: string;
  type: 'income' | 'expense';
  accountId: string;
  categoryId: string;
  notes: string;
}

export function InlineEditableTransactionTable({
  transactions,
  accounts,
  categories,
  tags,
  onEdit,
  onDelete,
  loading,
}: InlineEditableTransactionTableProps) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    accountId: '',
    categoryId: '',
    notes: '',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transaction updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transaction created');
      setIsAddingNew(false);
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        accountId: '',
        categoryId: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    },
  });

  const handleCellSave = (transaction: any, field: string, value: any) => {
    const updateData = { [field]: value };
    updateMutation.mutate({ id: transaction.id, data: updateData });
    setEditingCell(null);
  };

  const handleStartEdit = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c: any) => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.find((a: any) => a.id === accountId);
    return account?.name || 'Unknown';
  };

  const accountOptions = accounts?.map((a: any) => ({
    value: a.id,
    label: a.name,
  })) || [];

  const categoryOptions = categories?.map((c: any) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const handleSaveNew = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.accountId) {
      toast.error('Please fill in description, amount, and account');
      return;
    }

    createMutation.mutate({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
    });
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'expense',
      accountId: '',
      categoryId: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {/* Add New Row */}
            {isAddingNew && (
              <tr className="bg-blue-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    placeholder="Description"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={newTransaction.categoryId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={newTransaction.accountId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">Select account</option>
                    {accountOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded border border-gray-300 px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSaveNew}
                      disabled={createMutation.isPending}
                      className="rounded p-1 text-green-600 hover:bg-green-50"
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelNew}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Existing Transactions */}
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <InlineEditableCell
                    value={transaction.date}
                    type="date"
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'date'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'date')}
                    onSave={(value) => handleCellSave(transaction, 'date', value)}
                    onCancel={handleCancelEdit}
                    renderDisplay={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                </td>
                <td className="px-6 py-4">
                  <InlineEditableCell
                    value={transaction.description}
                    type="text"
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'description'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'description')}
                    onSave={(value) => handleCellSave(transaction, 'description', value)}
                    onCancel={handleCancelEdit}
                    placeholder="Description"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <InlineEditableCell
                    value={transaction.categoryId}
                    type="select"
                    options={categoryOptions}
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'categoryId'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'categoryId')}
                    onSave={(value) => handleCellSave(transaction, 'categoryId', value)}
                    onCancel={handleCancelEdit}
                    renderDisplay={(value) => (
                      <span className="text-sm text-gray-500">{getCategoryName(value)}</span>
                    )}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <InlineEditableCell
                    value={transaction.accountId}
                    type="select"
                    options={accountOptions}
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'accountId'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'accountId')}
                    onSave={(value) => handleCellSave(transaction, 'accountId', value)}
                    onCancel={handleCancelEdit}
                    renderDisplay={(value) => (
                      <span className="text-sm text-gray-500">{getAccountName(value)}</span>
                    )}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <InlineEditableCell
                    value={transaction.type}
                    type="select"
                    options={[
                      { value: 'income', label: 'Income' },
                      { value: 'expense', label: 'Expense' },
                    ]}
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'type'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'type')}
                    onSave={(value) => handleCellSave(transaction, 'type', value)}
                    onCancel={handleCancelEdit}
                    renderDisplay={(value) => (
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        value === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value}
                      </span>
                    )}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <InlineEditableCell
                    value={transaction.amount}
                    type="currency"
                    isEditing={editingCell?.rowId === transaction.id && editingCell?.field === 'amount'}
                    onStartEdit={() => handleStartEdit(transaction.id, 'amount')}
                    onSave={(value) => handleCellSave(transaction, 'amount', value)}
                    onCancel={handleCancelEdit}
                    renderDisplay={(value) => (
                      <span className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${Number(value).toFixed(2)}
                      </span>
                    )}
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {transactions.length === 0 && !isAddingNew && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No transactions found. Click "+ Add Transaction" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Button */}
      {!isAddingNew && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      )}
    </div>
  );
}
