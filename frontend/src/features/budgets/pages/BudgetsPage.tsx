import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { budgetsApi, categoriesApi, exportApi } from '@services/api';
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BudgetModal from '../components/BudgetModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getBudgetProgressColor, getBudgetProgressTextColor, formatBudgetPeriod } from '../config/budgets.config';
import { ExportButton, ExportFormat } from '@/components/export';
import { toast } from 'react-hot-toast';
import { UsageLimitBanner, ProtectedAction } from '@/components/feature-gate';
import { FeatureFlag } from '@/config/features.config';

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/budgets/new';
  const isEditModal = location.pathname.startsWith('/budgets/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const budgetId = id;

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Fetch selected budget for edit mode
  const { data: selectedBudgetData } = useQuery({
    queryKey: ['budget', budgetId],
    queryFn: () => budgetsApi.getById(budgetId!),
    enabled: !!budgetId && modalMode === 'edit',
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleEdit = (budget: any) => {
    navigate(`/budgets/edit/${budget.id}`);
  };

  const handleCloseModal = () => {
    navigate('/budgets');
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this budget? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      let response;
      if (format === 'csv') {
        response = await exportApi.exportBudgetsCSV({});
      } else if (format === 'excel') {
        response = await exportApi.exportBudgetsExcel({});
      } else if (format === 'pdf') {
        response = await exportApi.exportBudgetsPDF({});
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
        a.download = `budgets_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Budgets exported as ${format.toUpperCase()} successfully!`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export budgets');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.data?.find((c: any) => c.id === categoryId);
    return category?.name || 'All Categories';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Usage Limit Warning */}
      <UsageLimitBanner resource="maxBudgets" />

      {/* Header - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Set spending limits and track your progress
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ProtectedAction feature={FeatureFlag.EXPORT_DATA} behavior="disable">
            <ExportButton
              entityType="budgets"
              onExport={handleExport}
              variant="button"
              label="Export"
            />
          </ProtectedAction>
          <button
            onClick={() => navigate('/budgets/new')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Create Budget</span>
          </button>
        </div>
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
            onClick={() => navigate('/budgets/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {budgets?.data?.map((budget: any) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const remaining = budget.amount - budget.spent;
            const isOverBudget = percentage > 100;

            return (
              <div
                key={budget.id}
                className="rounded-lg bg-white p-4 sm:p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {budget.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                      {getCategoryName(budget.categoryId)}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      aria-label="Edit budget"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Period */}
                <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{formatBudgetPeriod(budget.period)}</span>
                </div>
                {budget.startDate && budget.endDate && (
                  <div className="mt-1 text-xs text-gray-500 pl-5 sm:pl-6">
                    {format(parseISO(budget.startDate), 'MMM dd')} -{' '}
                    {format(parseISO(budget.endDate), 'MMM dd, yyyy')}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className={`font-medium ${getBudgetProgressTextColor(percentage)}`}>
                      ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </span>
                    <span className={`font-semibold ${getBudgetProgressTextColor(percentage)}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${getBudgetProgressColor(percentage)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget ? (
                    <div className="mt-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>Over by ${Math.abs(remaining).toFixed(2)}</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs sm:text-sm text-gray-600">
                      ${remaining.toFixed(2)} remaining
                    </p>
                  )}
                </div>

                {/* Alert Threshold */}
                {budget.alertThreshold && (
                  <div className="mt-3 sm:mt-4 rounded-lg bg-gray-50 p-2.5 sm:p-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        Alert at {budget.alertThreshold}% (
                        ${((budget.amount * budget.alertThreshold) / 100).toFixed(2)})
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
      <BudgetModal
        isOpen={!!modalMode}
        budget={modalMode === 'edit' ? selectedBudgetData?.data : null}
        onClose={handleCloseModal}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
