import { useQueryClient } from '@tanstack/react-query';
import { lendBorrowApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getLendBorrowFormConfig, LendBorrowFormData } from '../config/lendBorrowFormConfig';

interface LendBorrowModalProps {
  record?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function LendBorrowModal({ record, isOpen, onClose }: LendBorrowModalProps) {
  const queryClient = useQueryClient();
  const formConfig = getLendBorrowFormConfig(record);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

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
      reset(); // Clear dirty state on successful submit
      onClose();
    },
    transform: (data) => ({
      ...data,
      dueDate: data.dueDate || undefined,
      description: data.description || undefined,
    }),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="lg"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={record ? 'Update Record' : 'Add Record'}
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
