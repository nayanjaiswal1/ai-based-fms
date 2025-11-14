import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { investmentsApi } from '@services/api';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import InvestmentModal from '../components/InvestmentModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { InvestmentsTable } from '../components/InvestmentsTable';
import { StatusBar } from '@/components/ui/StatusBar';
import { useCurrency } from '@/hooks/useCurrency';
import { PageHeader } from '@/components/ui/PageHeader';

export default function InvestmentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/investments/new';
  const isEditModal = location.pathname.startsWith('/investments/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const investmentId = id;

  const { data: allInvestments, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: investmentsApi.getAll,
  });

  // Filter investments based on search and filters
  const investments = useMemo(() => {
    if (!allInvestments?.data) return allInvestments;

    let filtered = allInvestments.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((inv: any) =>
        inv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter((inv: any) => inv.type === typeFilter);
    }

    return { ...allInvestments, data: filtered };
  }, [allInvestments, searchTerm, typeFilter]);

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: investmentsApi.getPortfolio,
  });

  // Fetch selected investment for edit mode
  const { data: selectedInvestmentData } = useQuery({
    queryKey: ['investment', investmentId],
    queryFn: () => investmentsApi.getById(investmentId!),
    enabled: !!investmentId && modalMode === 'edit',
  });

  const deleteMutation = useMutation({
    mutationFn: investmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const handleEdit = (investment: any) => {
    navigate(`/investments/edit/${investment.id}`);
  };

  const handleCloseModal = () => {
    navigate('/investments');
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Investment',
      message: 'Are you sure you want to delete this investment? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const { formatLocale } = useCurrency();

  const portfolioStats = portfolio?.data || {
    totalInvested: 0,
    totalCurrentValue: 0,
    totalROI: 0,
    totalROIPercentage: 0,
  };

  const statusBarItems = useMemo(() => [
    {
      id: 'invested',
      label: 'Invested',
      value: formatLocale(portfolioStats.totalInvested),
      icon: DollarSign,
      color: '#3b82f6',
      details: [
        { label: 'Total Invested', value: formatLocale(portfolioStats.totalInvested) },
        { label: 'Number of Investments', value: investments?.data?.length || 0 },
      ],
    },
    {
      id: 'current',
      label: 'Current Value',
      value: formatLocale(portfolioStats.totalCurrentValue),
      icon: TrendingUp,
      color: '#10b981',
      details: [
        { label: 'Current Value', value: formatLocale(portfolioStats.totalCurrentValue) },
        { label: 'Profit/Loss', value: formatLocale(portfolioStats.totalROI) },
      ],
    },
    {
      id: 'roi',
      label: 'ROI',
      value: formatLocale(portfolioStats.totalROI),
      icon: portfolioStats.totalROI >= 0 ? TrendingUp : TrendingDown,
      color: portfolioStats.totalROI >= 0 ? '#10b981' : '#ef4444',
      details: [
        { label: 'Total ROI', value: formatLocale(portfolioStats.totalROI) },
        { label: 'ROI Percentage', value: Number(portfolioStats.totalROIPercentage).toFixed(2) + '%' },
      ],
    },
    {
      id: 'percentage',
      label: 'ROI %',
      value: Number(portfolioStats.totalROIPercentage).toFixed(2) + '%',
      icon: Percent,
      color: portfolioStats.totalROIPercentage >= 0 ? '#10b981' : '#ef4444',
    },
  ], [portfolioStats, investments, formatLocale]);

  const activeFiltersCount = typeFilter ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search investments..."
        showFilter={true}
        onFilterClick={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
        buttons={[
          {
            label: 'Add Investment',
            icon: Plus,
            onClick: () => navigate('/investments/new'),
            variant: 'primary' as const,
          },
        ]}
      />

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="crypto">Crypto</option>
                <option value="mutual_fund">Mutual Fund</option>
                <option value="etf">ETF</option>
                <option value="real_estate">Real Estate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              <button
                onClick={() => {
                  setTypeFilter('');
                  setSearchTerm('');
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investments List */}
      <InvestmentsTable
        investments={investments?.data}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddFirst={() => navigate('/investments/new')}
      />

      {/* Modal */}
      <InvestmentModal
        isOpen={!!modalMode}
        investment={modalMode === 'edit' ? selectedInvestmentData?.data : null}
        onClose={handleCloseModal}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />

      {/* Excel-style Status Bar */}
      {investments?.data && investments.data.length > 0 && <StatusBar items={statusBarItems} />}
    </div>
  );
}
