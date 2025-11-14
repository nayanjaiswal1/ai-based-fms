import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi, tagsApi } from '@services/api';
import { format } from 'date-fns';
import { ArrowLeft, Save, Calendar, DollarSign, Tag, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BudgetFormData {
  budgetMonth: string;
  name: string;
  amount: number;
  period: 'monthly';
  type: 'category' | 'tag' | 'overall';
  categoryId?: string;
  tagId?: string;
  alertEnabled: boolean;
  alertThreshold: number;
  notes: string;
}

export default function CreateBudgetPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState<BudgetFormData>({
    budgetMonth: currentMonth,
    name: '',
    amount: 0,
    period: 'monthly',
    type: 'category',
    categoryId: '',
    tagId: '',
    alertEnabled: true,
    alertThreshold: 80,
    notes: '',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      // Calculate start and end dates from month
      const [year, month] = data.budgetMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const monthLabel = startDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      // Auto-generate name if not provided
      let budgetName = data.name;
      if (!budgetName) {
        if (data.type === 'category' && data.categoryId) {
          const category = categories?.data?.find((c: any) => c.id === data.categoryId);
          budgetName = `${category?.name || 'Category'} - ${monthLabel}`;
        } else if (data.type === 'tag' && data.tagId) {
          const tag = tags?.data?.find((t: any) => t.id === data.tagId);
          budgetName = `${tag?.name || 'Tag'} - ${monthLabel}`;
        } else {
          budgetName = `Budget - ${monthLabel}`;
        }
      } else if (!budgetName.includes(monthLabel)) {
        budgetName = `${budgetName} - ${monthLabel}`;
      }

      return budgetsApi.create({
        name: budgetName,
        amount: data.amount,
        period: data.period,
        type: data.type,
        categoryId: data.categoryId || undefined,
        tagId: data.tagId || undefined,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        alertEnabled: data.alertEnabled,
        alertThreshold: data.alertThreshold,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget created successfully!');
      navigate('/budgets');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (formData.type === 'category' && !formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (formData.type === 'tag' && !formData.tagId) {
      toast.error('Please select a tag');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (field: keyof BudgetFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedMonth = formData.budgetMonth
    ? new Date(formData.budgetMonth + '-01').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/budgets')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Budgets
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Budget</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set up a budget for {selectedMonth || 'a specific month'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Month Selection */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-blue-100 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Budget Month</h2>
                <p className="text-sm text-gray-600">Select the month for this budget</p>
              </div>
            </div>
            <input
              type="month"
              value={formData.budgetMonth}
              onChange={(e) => handleChange('budgetMonth', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Budget Details */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Budget Details</h2>
                <p className="text-sm text-gray-600">Configure your budget amount and type</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Budget Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  required
                >
                  <option value="category">Category</option>
                  <option value="tag">Tag</option>
                  <option value="overall">Overall</option>
                </select>
              </div>

              {/* Category Selection (if type is category) */}
              {formData.type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories?.data?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tag Selection (if type is tag) */}
              {formData.type === 'tag' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag *
                  </label>
                  <select
                    value={formData.tagId}
                    onChange={(e) => handleChange('tagId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                  >
                    <option value="">Select a tag</option>
                    {tags?.data?.map((tag: any) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Budget Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to auto-generate based on category/tag and month
                </p>
              </div>

              {/* Budget Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-yellow-100 p-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Alert Settings</h2>
                <p className="text-sm text-gray-600">Get notified when reaching limits</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Alerts</label>
                  <p className="text-xs text-gray-500">Receive notifications when threshold is reached</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('alertEnabled', !formData.alertEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.alertEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.alertEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Alert Threshold */}
              {formData.alertEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={formData.alertThreshold}
                    onChange={(e) =>
                      handleChange('alertThreshold', parseInt(e.target.value) || 80)
                    }
                    min="0"
                    max="100"
                    step="5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You'll be notified when you reach {formData.alertThreshold}% of your budget
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional notes about this budget..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/budgets')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
