import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { DateFilters } from './filters/DateFilters';
import { AmountFilters } from './filters/AmountFilters';

interface FilterModalProps {
  filters: any;
  isOpen: boolean;
  onApply: (filters: any) => void;
  onClose: () => void;
}

export default function FilterModal({ filters, isOpen, onApply, onClose }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters((prev: any) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleDateChange = (startDate?: string, endDate?: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleAmountChange = (minAmount?: string, maxAmount?: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      minAmount,
      maxAmount,
    }));
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Transactions"
      description="Apply filters to find specific transactions"
      size="xl"
    >
      <div className="space-y-6">
        {/* Date Filters */}
        <DateFilters
          startDate={localFilters.startDate}
          endDate={localFilters.endDate}
          onDateChange={handleDateChange}
        />

        {/* Type, Account, Category, Tag */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={localFilters.type || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Account
            </label>
            <select
              id="accountId"
              name="accountId"
              value={localFilters.accountId || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Accounts</option>
              {accounts?.data?.map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={localFilters.categoryId || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Categories</option>
              {categories?.data?.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tagId" className="block text-sm font-medium text-gray-700 mb-1.5">
              Tag
            </label>
            <select
              id="tagId"
              name="tagId"
              value={localFilters.tagId || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Tags</option>
              {tags?.data?.map((tag: any) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Filters */}
        <AmountFilters
          minAmount={localFilters.minAmount}
          maxAmount={localFilters.maxAmount}
          onAmountChange={handleAmountChange}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
}
