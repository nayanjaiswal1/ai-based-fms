import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi, budgetsApi } from '@services/api';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DollarSign,
  Sparkles,
  Edit2,
  Save,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface FinancialInfo {
  monthlyIncome: number;
  savingsGoal: number;
  debtPayments: number;
  regularExpenses: string[];
  additionalContext: string;
}

interface GeneratedBudget {
  categoryId: string;
  categoryName: string;
  amount: number;
  suggestedTags: string[];
  tagIds: string[];
  reasoning: string;
}

interface BudgetResponse {
  success: boolean;
  income: number;
  fixedExpenses: {
    savings: number;
    debt: number;
    regular: number;
    total: number;
  };
  availableForBudgets: number;
  budgets: GeneratedBudget[];
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
  generatedAt: string;
}

export default function AIBudgetWizardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo>({
    monthlyIncome: 0,
    savingsGoal: 0,
    debtPayments: 0,
    regularExpenses: [],
    additionalContext: '',
  });
  const [generatedBudgets, setGeneratedBudgets] = useState<BudgetResponse | null>(null);
  const [editedBudgets, setEditedBudgets] = useState<GeneratedBudget[]>([]);
  const [newExpense, setNewExpense] = useState('');

  // Mutation to generate budget
  const generateMutation = useMutation({
    mutationFn: aiApi.generateBudget,
    onSuccess: (data: any) => {
      setGeneratedBudgets(data);
      setEditedBudgets(data.budgets);
      setStep(2);
      toast.success('AI budget generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate budget');
    },
  });

  // Mutation to save budgets
  const saveBudgetsMutation = useMutation({
    mutationFn: async (budgets: GeneratedBudget[]) => {
      const promises = budgets.map((budget) =>
        budgetsApi.create({
          name: `${budget.categoryName} Budget`,
          amount: budget.amount,
          period: 'monthly',
          type: 'category',
          categoryId: budget.categoryId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            .toISOString()
            .split('T')[0],
          alertEnabled: true,
          alertThreshold: 80,
          aiGenerated: true,
          notes: budget.reasoning,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budgets saved successfully!');
      navigate('/budgets');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save budgets');
    },
  });

  const handleGenerate = () => {
    if (financialInfo.monthlyIncome <= 0) {
      toast.error('Please enter your monthly income');
      return;
    }
    generateMutation.mutate(financialInfo);
  };

  const handleAddExpense = () => {
    if (newExpense.trim()) {
      setFinancialInfo({
        ...financialInfo,
        regularExpenses: [...financialInfo.regularExpenses, newExpense],
      });
      setNewExpense('');
    }
  };

  const handleRemoveExpense = (index: number) => {
    setFinancialInfo({
      ...financialInfo,
      regularExpenses: financialInfo.regularExpenses.filter((_, i) => i !== index),
    });
  };

  const handleUpdateBudgetAmount = (index: number, newAmount: number) => {
    const updated = [...editedBudgets];
    updated[index].amount = newAmount;
    setEditedBudgets(updated);
  };

  const handleSaveBudgets = () => {
    if (editedBudgets.length === 0) {
      toast.error('No budgets to save');
      return;
    }
    saveBudgetsMutation.mutate(editedBudgets);
  };

  const totalAllocated = editedBudgets.reduce((sum, b) => sum + b.amount, 0);
  const remaining = generatedBudgets ? generatedBudgets.availableForBudgets - totalAllocated : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/budgets'))}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            AI Budget Wizard
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
            Create a personalized budget with AI assistance
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-5">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-semibold text-sm ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              {stepNum < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs sm:text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Financial Info
          </span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Review & Edit
          </span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            Save Budget
          </span>
        </div>
      </div>

      {/* Step 1: Financial Information */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-4 sm:space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Tell us about your finances
          </h2>

          <div className="space-y-3.5">
            {/* Monthly Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={financialInfo.monthlyIncome || ''}
                  onChange={(e) =>
                    setFinancialInfo({
                      ...financialInfo,
                      monthlyIncome: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>
            </div>

            {/* Savings Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Savings Goal (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={financialInfo.savingsGoal || ''}
                  onChange={(e) =>
                    setFinancialInfo({
                      ...financialInfo,
                      savingsGoal: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Debt Payments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Debt Payments (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={financialInfo.debtPayments || ''}
                  onChange={(e) =>
                    setFinancialInfo({
                      ...financialInfo,
                      debtPayments: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
            </div>

            {/* Regular Expenses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Monthly Expenses (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpense}
                  onChange={(e) => setNewExpense(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Rent: $1200"
                />
                <button
                  onClick={handleAddExpense}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {financialInfo.regularExpenses.length > 0 && (
                <div className="mt-2 space-y-2">
                  {financialInfo.regularExpenses.map((expense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{expense}</span>
                      <button
                        onClick={() => handleRemoveExpense(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={financialInfo.additionalContext}
                onChange={(e) =>
                  setFinancialInfo({
                    ...financialInfo,
                    additionalContext: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., I have a family of 4 and want to save for a vacation"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 sm:py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 shadow-md hover:shadow-lg transition-all font-medium text-sm sm:text-base"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Generating Budget...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                Generate AI Budget
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {step === 2 && generatedBudgets && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Monthly Income</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  ${generatedBudgets.income.toFixed(0)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Fixed Expenses</p>
                <p className="text-lg sm:text-xl font-bold text-orange-600">
                  ${generatedBudgets.fixedExpenses.total.toFixed(0)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Allocated</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  ${totalAllocated.toFixed(0)}
                </p>
              </div>
              <div className={`${remaining >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-3`}>
                <p className="text-xs text-gray-600 mb-1">Remaining</p>
                <p
                  className={`text-lg sm:text-xl font-bold ${
                    remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${remaining.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Budget Distribution ({editedBudgets.length} categories)
            </h2>
            <div className="space-y-3">
              {editedBudgets.map((budget, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {budget.categoryName}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{budget.reasoning}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {budget.suggestedTags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-shrink-0">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={budget.amount}
                        onChange={(e) =>
                          handleUpdateBudgetAmount(index, parseFloat(e.target.value) || 0)
                        }
                        className="w-28 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          {generatedBudgets.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                AI Recommendations
              </h3>
              <ul className="space-y-1.5">
                {generatedBudgets.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-blue-800 leading-relaxed">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm border border-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleSaveBudgets}
              disabled={saveBudgetsMutation.isPending || remaining < 0}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium text-sm shadow-md hover:shadow-lg"
            >
              {saveBudgetsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Budgets...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save All Budgets ({editedBudgets.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
