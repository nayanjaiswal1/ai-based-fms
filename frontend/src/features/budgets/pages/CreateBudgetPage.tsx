import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi, aiApi } from '@services/api';
import { ArrowLeft, Save, Sparkles, X, Loader2, Plus, TrendingUp, Calendar, DollarSign, PieChart, Lightbulb, Info, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrency } from '@/hooks/useCurrency';

interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  amount: number;
  reasoning?: string;
  suggestedTags?: string[];
}

interface AIResponse {
  income: number;
  fixedExpenses: {
    savings: number;
    debt: number;
    regular: number;
    total: number;
  };
  availableForBudgets: number;
  budgets: any[];
  summary: {
    totalAllocated: number;
    remaining: number;
    distribution: {
      needs: number;
      wants: number;
      savings: number;
    };
  };
  recommendations: string[];
}

export default function CreateBudgetPage() {
  const { symbol } = useCurrency();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [budgetMonth, setBudgetMonth] = useState(currentMonth);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [aiContext, setAiContext] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // AI Budget Generation
  const generateAIMutation = useMutation({
    mutationFn: async () => {
      return aiApi.generateBudget({
        monthlyIncome,
        additionalContext: aiContext || undefined,
      });
    },
    onSuccess: (response: any) => {
      const responseData = response.data || response;

      if (responseData.budgets && Array.isArray(responseData.budgets)) {
        const aiBudgets: CategoryBudget[] = responseData.budgets.map((b: any) => ({
          categoryId: b.categoryId,
          categoryName: b.categoryName,
          amount: b.amount,
          reasoning: b.reasoning,
          suggestedTags: b.suggestedTags || [],
        }));

        setCategoryBudgets(aiBudgets);
        setAiResponse(responseData);
        toast.success(`Generated ${aiBudgets.length} category budgets!`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate budgets');
    },
  });

  // Save Budget
  const saveBudgetMutation = useMutation({
    mutationFn: async () => {
      const [year, month] = budgetMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const monthLabel = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const promises = categoryBudgets.map((cb) =>
        budgetsApi.create({
          name: `${cb.categoryName} - ${monthLabel}`,
          amount: cb.amount,
          period: 'monthly',
          type: 'category',
          categoryId: cb.categoryId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          alertEnabled: true,
          alertThreshold: 80,
        })
      );

      return Promise.all(promises);
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

  const addCategoryBudget = (categoryId: string) => {
    const category = categories?.data?.find((c: any) => c.id === categoryId);
    if (!category) return;

    if (categoryBudgets.find(cb => cb.categoryId === categoryId)) {
      toast.error('Category already added');
      return;
    }

    setCategoryBudgets([
      ...categoryBudgets,
      { categoryId, categoryName: category.name, amount: 0 }
    ]);
  };

  const removeCategoryBudget = (categoryId: string) => {
    setCategoryBudgets(categoryBudgets.filter(cb => cb.categoryId !== categoryId));
  };

  const updateAmount = (categoryId: string, amount: number) => {
    setCategoryBudgets(categoryBudgets.map(cb =>
      cb.categoryId === categoryId ? { ...cb, amount } : cb
    ));
  };

  const handleSave = () => {
    if (categoryBudgets.length === 0) {
      toast.error('Add at least one category budget');
      return;
    }

    if (categoryBudgets.some(cb => cb.amount <= 0)) {
      toast.error('All amounts must be greater than 0');
      return;
    }

    saveBudgetMutation.mutate();
  };

  const totalBudget = categoryBudgets.reduce((sum, cb) => sum + cb.amount, 0);
  const selectedMonth = new Date(budgetMonth + '-01').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const availableCategories = categories?.data?.filter(
    (c: any) => !categoryBudgets.find(cb => cb.categoryId === c.id)
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/budgets')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Budgets</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Budget</h1>
              <p className="text-gray-600 mt-1">{selectedMonth}</p>
            </div>
          </div>
        </div>

        {/* Month & AI Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Month */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                Budget Month
              </label>
              <input
                type="month"
                value={budgetMonth}
                onChange={(e) => setBudgetMonth(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base"
              />
            </div>

            {/* Income */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                Monthly Income
                <span className="text-xs font-normal text-gray-500">(for AI generation)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {symbol()}
                </span>
                <input
                  type="number"
                  value={monthlyIncome || ''}
                  onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base"
                />
              </div>
            </div>
          </div>

          {/* AI Context */}
          {monthlyIncome > 0 && (
            <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <label className="block text-sm font-semibold text-purple-900 mb-2">
                Additional Context (Optional)
              </label>
              <input
                type="text"
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                placeholder="e.g., Family of 4, saving for vacation, rent $1200"
                className="w-full px-4 py-2.5 border-2 border-purple-200 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
              />
              <p className="mt-2 text-xs text-purple-700">
                Add any relevant information to help AI create personalized budgets
              </p>
            </div>
          )}

          {/* AI Button */}
          <button
            onClick={() => generateAIMutation.mutate()}
            disabled={generateAIMutation.isPending || monthlyIncome <= 0}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            {generateAIMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating AI Budget...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Budget with AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Insights */}
        {aiResponse && (
          <div className="space-y-4 mb-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Distribution */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-blue-900">Distribution</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Needs</span>
                    <span className="font-bold text-blue-900">{symbol()}{aiResponse.summary.distribution.needs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Wants</span>
                    <span className="font-bold text-blue-900">{symbol()}{aiResponse.summary.distribution.wants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-800">Savings</span>
                    <span className="font-bold text-blue-900">{symbol()}{aiResponse.summary.distribution.savings.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Expenses */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Fixed Expenses</h3>
                </div>
                <div className="space-y-2">
                  {aiResponse.fixedExpenses.savings > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-800">Savings</span>
                      <span className="font-bold text-orange-900">{symbol()}{aiResponse.fixedExpenses.savings.toLocaleString()}</span>
                    </div>
                  )}
                  {aiResponse.fixedExpenses.debt > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-800">Debt</span>
                      <span className="font-bold text-orange-900">{symbol()}{aiResponse.fixedExpenses.debt.toLocaleString()}</span>
                    </div>
                  )}
                  {aiResponse.fixedExpenses.regular > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-800">Regular</span>
                      <span className="font-bold text-orange-900">{symbol()}{aiResponse.fixedExpenses.regular.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-orange-200">
                    <span className="text-sm font-bold text-orange-800">Total</span>
                    <span className="font-bold text-orange-900">{symbol()}{aiResponse.fixedExpenses.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Available Budget */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Budget Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Income</span>
                    <span className="font-bold text-green-900">{symbol()}{aiResponse.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Allocated</span>
                    <span className="font-bold text-green-900">{symbol()}{aiResponse.summary.totalAllocated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-green-200">
                    <span className="text-sm font-bold text-green-800">Remaining</span>
                    <span className="font-bold text-green-900">{symbol()}{aiResponse.summary.remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {aiResponse.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">AI Recommendations</h3>
                </div>
                <ul className="space-y-2">
                  {aiResponse.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm text-purple-800">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Category Budgets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Category Budgets</h2>
                <p className="text-sm text-gray-600">{categoryBudgets.length} categories</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600">{symbol()}{totalBudget.toLocaleString()}</p>
            </div>
          </div>

          {/* Budget Items */}
          {categoryBudgets.length > 0 ? (
            <div className="space-y-2 mb-6">
              {categoryBudgets.map((cb, index) => (
                <div
                  key={cb.categoryId}
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {/* Left: Category Name */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 mb-1">{cb.categoryName}</div>
                    {cb.suggestedTags && cb.suggestedTags.length > 0 && (
                      <div className="flex gap-1.5 mb-1 flex-wrap">
                        {cb.suggestedTags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {cb.reasoning && (
                      <div className="text-xs text-gray-500 truncate">{cb.reasoning}</div>
                    )}
                  </div>

                  {/* Right: Amount and Remove */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {symbol()}
                      </span>
                      <input
                        type="number"
                        value={cb.amount || ''}
                        onChange={(e) => updateAmount(cb.categoryId, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        step="0.01"
                        className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-medium"
                      />
                    </div>
                    <button
                      onClick={() => removeCategoryBudget(cb.categoryId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">No categories added yet</p>
              <p className="text-sm text-gray-500">
                Add categories manually or use AI to generate a complete budget
              </p>
            </div>
          )}

          {/* Add Category */}
          {availableCategories.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Category Manually
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addCategoryBudget(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium text-gray-700 bg-white hover:border-gray-300 cursor-pointer"
              >
                <option value="">+ Select a category to add...</option>
                {availableCategories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        {categoryBudgets.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/budgets')}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveBudgetMutation.isPending}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              {saveBudgetMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving Budget...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Budget</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
