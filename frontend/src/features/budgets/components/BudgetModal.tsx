import { useQuery } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getBudgetFormConfig, BudgetFormData } from '../config/budgetFormConfig';

interface BudgetModalProps {
  budget?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetModal({ budget, isOpen, onClose }: BudgetModalProps) {
  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Get form config
  const formConfig = getBudgetFormConfig(budget, categories?.data || []);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<BudgetFormData>({
    api: {
      create: budgetsApi.create,
      update: (id, data) => budgetsApi.update(String(id), data),
    },
    queryKey: ['budgets'],
    entityId: budget?.id,
    onSuccess: () => {
      reset(); // Clear dirty state on successful submit
      onClose();
    },
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
        submitLabel={budget ? 'Update Budget' : 'Create Budget'}
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
