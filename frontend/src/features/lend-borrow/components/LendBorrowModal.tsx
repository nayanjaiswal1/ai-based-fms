import { useQueryClient } from '@tanstack/react-query';
import { lendBorrowApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getLendBorrowFormConfig, LendBorrowFormData } from '../config/lendBorrowFormConfig';

interface LendBorrowModalProps {
  record?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function LendBorrowModal({ record, isOpen, onClose }: LendBorrowModalProps) {
  const queryClient = useQueryClient();
  const formConfig = getLendBorrowFormConfig(record);

  const { handleSubmit, isLoading } = useEntityForm<LendBorrowFormData>({
    api: {
      create: lendBorrowApi.create,
      update: (id, data) => lendBorrowApi.update(String(id), data),
    },
    queryKey: ['lend-borrow'],
    entityId: record?.id,
    onSuccess: () => {
      // Also invalidate summary query
      queryClient.invalidateQueries({ queryKey: ['lend-borrow-summary'] });
      onClose();
    },
    transform: (data) => ({
      ...data,
      dueDate: data.dueDate || undefined,
      description: data.description || undefined,
    }),
  });

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="lg"
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={record ? 'Update Record' : 'Add Record'}
      />
    </ModernModal>
  );
}
