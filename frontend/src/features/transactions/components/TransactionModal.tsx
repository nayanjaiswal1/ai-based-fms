import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi, transactionsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getTransactionFormConfig, TransactionFormData } from '../config/transactionFormConfig';

interface TransactionModalProps {
  transaction?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  const queryClient = useQueryClient();

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  // Fetch dropdown data using hooks
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Handler to create new category
  const handleCreateCategory = async (name: string): Promise<string> => {
    try {
      const response = await categoriesApi.create({
        name,
        type: 'expense', // Default to expense, user can change later
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      });
      // Invalidate categories query to refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      return response.data.id;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };

  // Handler to create new tag
  const handleCreateTag = async (name: string): Promise<string> => {
    try {
      const response = await tagsApi.create({
        name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
      });
      // Invalidate tags query to refetch
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      return response.data.id;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };

  // Get form config with dynamic data and create handlers
  const formConfig = getTransactionFormConfig(
    transaction,
    accounts?.data || [],
    categories?.data || [],
    tags?.data || [],
    handleCreateCategory,
    handleCreateTag
  );

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<TransactionFormData>({
    api: {
      create: transactionsApi.create,
      update: (id, data) => transactionsApi.update(String(id), data),
    },
    queryKey: ['transactions'],
    entityId: transaction?.id,
    onSuccess: () => {
      reset(); // Clear dirty state on successful submit
      onClose();
    },
  });

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="xl"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={transaction ? 'Update Transaction' : 'Add Transaction'}
        onDirtyChange={setIsDirty}
      />
    </ModernModal>
  );
}
