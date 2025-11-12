import { useQuery } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
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

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<BudgetFormData>({
    api: {
      create: budgetsApi.create,
      update: (id, data) => budgetsApi.update(String(id), data),
    },
    queryKey: ['budgets'],
    entityId: budget?.id,
    onSuccess: onClose,
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
        submitLabel={budget ? 'Update Budget' : 'Create Budget'}
      />
    </ModernModal>
  );
}
