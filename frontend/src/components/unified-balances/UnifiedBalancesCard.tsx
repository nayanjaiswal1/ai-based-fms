import { useQuery } from '@tanstack/react-query';
import { groupsApi, lendBorrowApi } from '@services/api';
import { Users, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { useNavigate } from 'react-router-dom';

export function UnifiedBalancesCard() {
  const navigate = useNavigate();
  const { formatLocale } = useCurrency();

  const { data: unifiedBalances } = useQuery({
    queryKey: ['unified-balances'],
    queryFn: groupsApi.getUnifiedBalances,
  });

  const { data: lendBorrowSummary } = useQuery({
    queryKey: ['lend-borrow-summary'],
    queryFn: lendBorrowApi.getSummary,
  });

  const groupsData = unifiedBalances?.data?.summary || { totalOwed: 0, totalOwing: 0, netPosition: 0 };
  const lendBorrowData = lendBorrowSummary?.data || { totalOwed: 0, totalOwing: 0 };

  // Combined totals
  const totalOwed = Number(groupsData.totalOwed || 0) + Number(lendBorrowData.totalOwed || 0);
  const totalOwing = Number(groupsData.totalOwing || 0) + Number(lendBorrowData.totalOwing || 0);
  const netPosition = totalOwed - totalOwing;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Shared Finance Overview</h3>
        <Users className="h-5 w-5 text-gray-400" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">You're Owed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatLocale(totalOwed)}</p>
        </div>

        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">You Owe</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatLocale(totalOwing)}</p>
        </div>

        <div className={`rounded-lg p-4 ${netPosition >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className={`h-4 w-4 ${netPosition >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-sm font-medium ${netPosition >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              Net Position
            </span>
          </div>
          <p className={`text-2xl font-bold ${netPosition >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatLocale(Math.abs(netPosition))}
          </p>
        </div>
      </div>

      {/* Breakdown by Source */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Breakdown</h4>

        <div
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => navigate('/groups')}
        >
          <div>
            <p className="text-sm font-medium text-gray-900">Shared Expense Groups</p>
            <p className="text-xs text-gray-500">
              {unifiedBalances?.data?.groups?.length || 0} active groups
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">
              +{formatLocale(groupsData.totalOwed || 0)}
            </p>
            <p className="text-sm font-semibold text-red-600">
              -{formatLocale(groupsData.totalOwing || 0)}
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => navigate('/lend-borrow')}
        >
          <div>
            <p className="text-sm font-medium text-gray-900">Lend & Borrow</p>
            <p className="text-xs text-gray-500">
              Individual debt tracking
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">
              +{formatLocale(lendBorrowData.totalOwed || 0)}
            </p>
            <p className="text-sm font-semibold text-red-600">
              -{formatLocale(lendBorrowData.totalOwing || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate('/lend-borrow/new')}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Lend/Borrow
        </button>
        <button
          onClick={() => navigate('/groups/new')}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
