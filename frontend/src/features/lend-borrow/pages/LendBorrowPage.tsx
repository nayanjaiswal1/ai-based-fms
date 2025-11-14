import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { lendBorrowApi } from '@services/api';
import { Plus, DollarSign } from 'lucide-react';
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

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/lend-borrow/new';
  const isEditModal = location.pathname.startsWith('/lend-borrow/edit/');
  const modalMode = isNewModal ? 'new' : isEditModal ? 'edit' : null;
  const recordId = id;

  const { data: records, isLoading } = useQuery({
    queryKey: ['lend-borrow', filters],
    queryFn: () => lendBorrowApi.getAll(filters),
  });

  const { data: summary } = useQuery({
    queryKey: ['lend-borrow-summary'],
    queryFn: lendBorrowApi.getSummary,
  });

  // Fetch selected record for edit mode
  const { data: selectedRecordData } = useQuery({
    queryKey: ['lend-borrow-record', recordId],
    queryFn: () => lendBorrowApi.getById(recordId!),
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
    navigate(`/lend-borrow/edit/${record.id}`);
  };

  const handleCloseModal = () => {
    navigate('/lend-borrow');
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

  const rawSummary = summary?.data || {};
  const summaryData = {
    totalLent: Number(rawSummary.totalLent ?? 0),
    totalBorrowed: Number(rawSummary.totalBorrowed ?? 0),
    totalOwed: Number(rawSummary.totalOwed ?? 0),
    totalOwing: Number(rawSummary.totalOwing ?? 0),
  };

  const columns = getLendBorrowColumns(handleEdit, handleDelete, handleRecordPayment);
  const filterConfigs = getLendBorrowFilters();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lend & Borrow</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track money you've lent or borrowed
          </p>
        </div>
        <button
          onClick={() => navigate('/lend-borrow/new')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summaryData.totalLent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summaryData.totalBorrowed.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Owed to You</p>
              <p className="text-2xl font-bold text-green-600">
                ${summaryData.totalOwed.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">You Owe</p>
              <p className="text-2xl font-bold text-red-600">
                ${summaryData.totalOwing.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Filters
            filters={filterConfigs}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>
      </div>

      {/* Records Table */}
      <DataTable
        columns={columns}
        data={records?.data || []}
        keyExtractor={(row) => row.id}
        loading={isLoading}
        emptyMessage={
          <div className="py-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">No records yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Start tracking money you've lent or borrowed
            </p>
            <button
              onClick={() => navigate('/lend-borrow/new')}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Your First Record
            </button>
          </div>
        }
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
    </div>
  );
}
