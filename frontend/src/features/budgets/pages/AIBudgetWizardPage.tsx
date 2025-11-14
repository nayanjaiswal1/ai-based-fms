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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/budgets'))}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            AI Budget Creation Wizard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Let AI help you create a personalized budget plan
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
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
        <div className="flex justify-between mt-2 text-sm">
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
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Tell us about your finances
          </h2>

          <div className="space-y-4">
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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Budget...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate AI Budget
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {step === 2 && generatedBudgets && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${generatedBudgets.income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fixed Expenses</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${generatedBudgets.fixedExpenses.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Allocated</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${totalAllocated.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p
                  className={`text-2xl font-bold ${
                    remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  ${remaining.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Budget Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Budget Distribution
            </h2>
            <div className="space-y-4">
              {editedBudgets.map((budget, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {budget.categoryName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{budget.reasoning}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {budget.suggestedTags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={budget.amount}
                        onChange={(e) =>
                          handleUpdateBudgetAmount(index, parseFloat(e.target.value) || 0)
                        }
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          {generatedBudgets.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Recommendations
              </h3>
              <ul className="space-y-2">
                {generatedBudgets.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <button
              onClick={handleSaveBudgets}
              disabled={saveBudgetsMutation.isPending || remaining < 0}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {saveBudgetsMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save All Budgets
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
