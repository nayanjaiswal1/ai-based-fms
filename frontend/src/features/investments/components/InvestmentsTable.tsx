import { Edit, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/hooks/useCurrency';

interface Investment {
  id: string;
  name: string;
  symbol?: string;
  type: string;
  investedAmount: number;
  currentValue: number;
  purchaseDate: string;
}

interface InvestmentsTableProps {
  investments: Investment[] | undefined;
  isLoading: boolean;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}

export function InvestmentsTable({
  investments,
  isLoading,
  onEdit,
  onDelete,
  onAddFirst,
}: InvestmentsTableProps) {
  const { symbol } = useCurrency();

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Loading investments...</p>
      </div>
    );
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">No investments yet</p>
        <p className="mt-2 text-sm text-gray-500">
          Start tracking your investment portfolio
        </p>
        <button
          onClick={onAddFirst}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Your First Investment
        </button>
      </div>
    );
  }

  return (
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
          {investments.map((investment) => {
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
                  {symbol()}{Number(investment.investedAmount).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {symbol()}{Number(investment.currentValue).toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`text-sm font-semibold ${
                      roi >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {roi >= 0 ? '+' : ''}{symbol()}{roi.toFixed(2)}
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
                    onClick={() => onEdit(investment)}
                    className="mr-3 text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(investment.id)}
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
  );
}
