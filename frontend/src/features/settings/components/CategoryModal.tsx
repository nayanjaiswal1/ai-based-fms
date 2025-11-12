import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getCategoryFormConfig, CategoryFormData } from '../../categories/config/categoryFormConfig';

interface CategoryModalProps {
  category?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryModal({ category, isOpen, onClose }: CategoryModalProps) {
  // Fetch all categories for parent dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Get form config
  const formConfig = getCategoryFormConfig(category, categories?.data || []);

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<CategoryFormData>({
    api: {
      create: categoriesApi.create,
      update: (id, data) => categoriesApi.update(String(id), data),
    },
    queryKey: ['categories'],
    entityId: category?.id,
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
        submitLabel={category ? 'Update Category' : 'Add Category'}
      />
    </ModernModal>
  );
}
