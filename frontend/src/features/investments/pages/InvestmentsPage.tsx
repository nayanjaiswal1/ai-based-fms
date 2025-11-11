import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsApi } from '@services/api';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { format } from 'date-fns';
import InvestmentModal from '../components/InvestmentModal';

export default function InvestmentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  const { data: investments, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: investmentsApi.getAll,
  });

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: investmentsApi.getPortfolio,
  });

  const deleteMutation = useMutation({
    mutationFn: investmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const handleEdit = (investment: any) => {
    setSelectedInvestment(investment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this investment?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const portfolioStats = portfolio?.data || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalROI: 0,
    totalROIPercentage: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your investment portfolio and returns
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedInvestment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                ${portfolioStats.totalInvested.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${portfolioStats.totalCurrentValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                portfolioStats.totalROI >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {portfolioStats.totalROI >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Return</p>
              <p
                className={`text-2xl font-bold ${
                  portfolioStats.totalROI >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {portfolioStats.totalROI >= 0 ? '+' : ''}$
                {portfolioStats.totalROI.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                portfolioStats.totalROIPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <Percent
                className={`h-5 w-5 ${
                  portfolioStats.totalROIPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">ROI %</p>
              <p
                className={`text-2xl font-bold ${
                  portfolioStats.totalROIPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {portfolioStats.totalROIPercentage >= 0 ? '+' : ''}
                {portfolioStats.totalROIPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">Loading investments...</p>
        </div>
      ) : investments?.data?.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No investments yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Start tracking your investment portfolio
          </p>
          <button
            onClick={() => {
              setSelectedInvestment(null);
              setIsModalOpen(true);
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Your First Investment
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Investment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Invested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ROI %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {investments?.data?.map((investment: any) => {
                const roi = investment.currentValue - investment.investedAmount;
                const roiPercentage = (roi / investment.investedAmount) * 100;

                return (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                      {investment.symbol && (
                        <div className="text-sm text-gray-500">{investment.symbol}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-500">
                      {investment.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      ${Number(investment.investedAmount).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      ${Number(investment.currentValue).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {roi >= 0 ? '+' : ''}${roi.toFixed(2)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {roiPercentage >= 0 ? '+' : ''}
                        {roiPercentage.toFixed(2)}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(investment.purchaseDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(investment)}
                        className="mr-3 text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <InvestmentModal
          investment={selectedInvestment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvestment(null);
          }}
        />
      )}
    </div>
  );
}
