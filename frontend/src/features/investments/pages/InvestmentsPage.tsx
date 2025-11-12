import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { investmentsApi } from '@services/api';
import { Plus } from 'lucide-react';
import InvestmentModal from '../components/InvestmentModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { InvestmentsTable } from '../components/InvestmentsTable';

export default function InvestmentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/investments/new';
  const isEditModal = location.pathname.startsWith('/investments/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const investmentId = id;

  const { data: investments, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: investmentsApi.getAll,
  });

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
          onClick={() => navigate('/investments/new')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary stats={portfolioStats} />

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
    </div>
  );
}
