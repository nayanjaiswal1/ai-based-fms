import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lendBorrowApi } from '@services/api';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface LendBorrowModalProps {
  record?: any;
  onClose: () => void;
}

export default function LendBorrowModal({ record, onClose }: LendBorrowModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: record?.type || 'lent',
    personName: record?.personName || '',
    amount: record?.amount || '',
    dueDate: record?.dueDate ? format(new Date(record.dueDate), 'yyyy-MM-dd') : '',
    description: record?.description || '',
    interestRate: record?.interestRate || '',
  });

  const createMutation = useMutation({
    mutationFn: lendBorrowApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-borrow'] });
      queryClient.invalidateQueries({ queryKey: ['lend-borrow-summary'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      lendBorrowApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-borrow'] });
      queryClient.invalidateQueries({ queryKey: ['lend-borrow-summary'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      dueDate: formData.dueDate || undefined,
      description: formData.description || undefined,
    };

    if (record) {
      await updateMutation.mutateAsync({ id: record.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {record ? 'Edit Record' : 'Add Lend/Borrow Record'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="lent"
                  checked={formData.type === 'lent'}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Lent (I gave money)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="borrowed"
                  checked={formData.type === 'borrowed'}
                  onChange={handleChange}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Borrowed (I received money)</span>
              </label>
            </div>
          </div>

          {/* Person Name and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700">
                Person Name
              </label>
              <input
                type="text"
                id="personName"
                name="personName"
                value={formData.personName}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Due Date and Interest Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date (optional)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                Interest Rate % (optional)
              </label>
              <input
                type="number"
                id="interestRate"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                step="0.01"
                placeholder="e.g., 5.5"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional details..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : record
                  ? 'Update Record'
                  : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
