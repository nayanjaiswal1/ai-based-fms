import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

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

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        startDate = endDate = format(subDays(today, 1), 'yyyy-MM-dd');
        break;
      case 'last7days':
        startDate = format(subDays(today, 7), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'last30days':
        startDate = format(subDays(today, 30), 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'thisMonth':
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'thisYear':
        startDate = format(startOfYear(today), 'yyyy-MM-dd');
        endDate = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      default:
        return;
    }

    setLocalFilters((prev: any) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleClear = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const datePresets = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
    { value: 'thisYear', label: 'This year' },
  ];

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Transactions"
      description="Apply filters to find specific transactions"
      size="xl"
    >
      <div className="space-y-6">
        {/* Date Range Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Quick Date Range</label>
          <div className="grid grid-cols-4 gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleDatePreset(preset.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={localFilters.startDate || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={localFilters.endDate || ''}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

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

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1.5">
              Min Amount
            </label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={localFilters.minAmount || ''}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1.5">
              Max Amount
            </label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={localFilters.maxAmount || ''}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

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
    </ModernModal>
  );
}
