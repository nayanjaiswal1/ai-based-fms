import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { lendBorrowApi } from '@services/api';
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { StatusBar } from '@/components/ui/StatusBar';
import { useCurrency } from '@/hooks/useCurrency';
import { PageHeader } from '@/components/ui/PageHeader';
import LendBorrowModal from '../components/LendBorrowModal';
import PaymentModal from '../components/PaymentModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable } from '@components/table';
import { Filters } from '@components/filters';
import { getLendBorrowColumns } from '../config/lendBorrowTable.config';
import { getLendBorrowFilters } from '../config/lendBorrowFilters.config';

export default function LendBorrowPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/lend-borrow/new' || location.pathname === '/shared-finance/lend-borrow/new';
  const isEditModal = location.pathname.startsWith('/lend-borrow/edit/') || location.pathname.startsWith('/shared-finance/lend-borrow/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const recordId = id;

  const { data: records, isLoading } = useQuery({
    queryKey: ['lend-borrow', filters, searchTerm],
    queryFn: () => lendBorrowApi.getAll({ ...filters, search: searchTerm || undefined }),
  });

  const { data: summary } = useQuery({
    queryKey: ['lend-borrow-summary'],
    queryFn: lendBorrowApi.getSummary,
  });

  // Fetch selected record for edit mode
  const { data: selectedRecordData } = useQuery({
    queryKey: ['lend-borrow-record', recordId],
    queryFn: () => lendBorrowApi.getOne(recordId!),
    enabled: !!recordId && modalMode === 'edit',
  });

  const deleteMutation = useMutation({
    mutationFn: lendBorrowApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-borrow'] });
      queryClient.invalidateQueries({ queryKey: ['lend-borrow-summary'] });
    },
  });

  const handleEdit = (record: any) => {
    const basePath = location.pathname.includes('/shared-finance') ? '/shared-finance/lend-borrow' : '/lend-borrow';
    navigate(`${basePath}/edit/${record.id}`);
  };

  const handleCloseModal = () => {
    const basePath = location.pathname.includes('/shared-finance') ? '/shared-finance/lend-borrow' : '/lend-borrow';
    navigate(basePath);
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: 'Delete Record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const handleRecordPayment = (record: any) => {
    setSelectedRecord(record);
    setIsPaymentModalOpen(true);
  };

  const { formatLocale } = useCurrency();

  const rawSummary = summary?.data || {};
  const summaryData = {
    totalLent: Number(rawSummary.totalLent ?? 0),
    totalBorrowed: Number(rawSummary.totalBorrowed ?? 0),
    totalOwed: Number(rawSummary.totalOwed ?? 0),
    totalOwing: Number(rawSummary.totalOwing ?? 0),
  };

  const statusBarItems = useMemo(() => [
    {
      id: 'lent',
      label: 'Lent',
      value: formatLocale(summaryData.totalLent),
      icon: TrendingUp,
      color: '#10b981',
      details: [
        { label: 'Total Amount Lent', value: formatLocale(summaryData.totalLent) },
        { label: 'Amount Owed to You', value: formatLocale(summaryData.totalOwed) },
      ],
    },
    {
      id: 'borrowed',
      label: 'Borrowed',
      value: formatLocale(summaryData.totalBorrowed),
      icon: TrendingDown,
      color: '#ef4444',
      details: [
        { label: 'Total Amount Borrowed', value: formatLocale(summaryData.totalBorrowed) },
        { label: 'Amount You Owe', value: formatLocale(summaryData.totalOwing) },
      ],
    },
    {
      id: 'owed',
      label: 'Owed to You',
      value: formatLocale(summaryData.totalOwed),
      icon: DollarSign,
      color: '#3b82f6',
    },
    {
      id: 'owing',
      label: 'You Owe',
      value: formatLocale(summaryData.totalOwing),
      icon: AlertCircle,
      color: '#f59e0b',
    },
  ], [summaryData, formatLocale]);

  const columns = getLendBorrowColumns(handleEdit, handleDelete, handleRecordPayment);
  const filterConfigs = getLendBorrowFilters();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search records..."
        showFilter={true}
        onFilterClick={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
        buttons={[
          {
            label: 'Add Record',
            icon: Plus,
            onClick: () => {
              const basePath = location.pathname.includes('/shared-finance') ? '/shared-finance/lend-borrow' : '/lend-borrow';
              navigate(`${basePath}/new`);
            },
            variant: 'primary' as const,
          },
        ]}
      />

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Filters
              filters={filterConfigs}
              values={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      )}

      {/* Records Table */}
      <DataTable
        columns={columns}
        data={records?.data || []}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage="No records yet"
      />

      {/* Modals */}
      <LendBorrowModal
        isOpen={!!modalMode}
        record={modalMode === 'edit' ? selectedRecordData?.data : null}
        onClose={handleCloseModal}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        record={selectedRecord}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedRecord(null);
        }}
      />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />

      {/* Excel-style Status Bar */}
      <StatusBar items={statusBarItems} />
    </div>
  );
}
