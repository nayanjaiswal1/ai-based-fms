import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lendBorrowApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getPaymentFormConfig, PaymentFormData } from '../config/paymentFormConfig';
import { useCurrency } from '@/hooks/useCurrency';

interface PaymentModalProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ record, isOpen, onClose }: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { symbol } = useCurrency();
  const formConfig = getPaymentFormConfig(record);
  const total = Number(record?.amount ?? 0);
  const paid = Number(record?.paidAmount ?? 0);
  const remaining = Math.max(0, total - paid);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      lendBorrowApi.recordPayment(record.id, {
        ...data,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lend-borrow'] });
      queryClient.invalidateQueries({ queryKey: ['lend-borrow-summary'] });
      reset(); // Clear dirty state on successful submit
      onClose();
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    return recordPaymentMutation.mutateAsync(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="lg"
      onBeforeClose={checkBeforeClose}
    >
      {/* Payment Info Summary */}
      <div className="mb-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Person:</span>
            <span className="font-medium text-gray-900">{record?.personName ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium text-gray-900">{symbol()}{Number(record?.amount ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Already Paid:</span>
            <span className="font-medium text-gray-900">{symbol()}{Number(record?.paidAmount ?? 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2">
            <span className="font-semibold text-gray-900">Remaining:</span>
            <span className="font-semibold text-blue-600">{symbol()}{remaining.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={recordPaymentMutation.isPending}
        onCancel={onClose}
        submitLabel="Record Payment"
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
