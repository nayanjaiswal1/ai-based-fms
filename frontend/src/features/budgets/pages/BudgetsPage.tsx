import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '@services/api';
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BudgetModal from '../components/BudgetModal';

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleEdit = (budget: any) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.data?.find((c: any) => c.id === categoryId);
    return category?.name || 'All Categories';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatPeriod = (period: string) => {
    const words = period.split('_');
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set spending limits and track your progress
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedBudget(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Budget
        </button>
      </div>

      {/* Loading/Empty States */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">Loading budgets...</p>
        </div>
      ) : budgets?.data?.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No budgets yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Create your first budget to start tracking spending
          </p>
          <button
            onClick={() => {
              setSelectedBudget(null);
              setIsModalOpen(true);
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {budgets?.data?.map((budget: any) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            const isOverBudget = percentage > 100;

            return (
              <div
                key={budget.id}
                className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {getCategoryName(budget.categoryId)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Period */}
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatPeriod(budget.period)}</span>
                  {budget.startDate && (
                    <span>
                      ({format(parseISO(budget.startDate), 'MMM dd')} -{' '}
                      {format(parseISO(budget.endDate), 'MMM dd, yyyy')})
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${getProgressTextColor(percentage)}`}>
                      ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                    </span>
                    <span className={`font-semibold ${getProgressTextColor(percentage)}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${getProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Over budget by ${Math.abs(remaining).toFixed(2)}</span>
                    </div>
                  )}
                  {!isOverBudget && (
                    <p className="mt-2 text-sm text-gray-600">
                      ${remaining.toFixed(2)} remaining
                    </p>
                  )}
                </div>

                {/* Alert Threshold */}
                {budget.alertThreshold && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Alert at {budget.alertThreshold}% (${' '}
                        {((budget.amount * budget.alertThreshold) / 100).toFixed(2)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <BudgetModal
          budget={selectedBudget}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
}
