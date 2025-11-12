import { useQuery } from '@tanstack/react-query';
import { accountsApi, categoriesApi, tagsApi, transactionsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getTransactionFormConfig, TransactionFormData } from '../config/transactionFormConfig';

interface TransactionModalProps {
  transaction?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
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

  // Get form config with dynamic data
  const formConfig = getTransactionFormConfig(
    transaction,
    accounts?.data || [],
    categories?.data || [],
    tags?.data || []
  );

  // Use entity form hook
  const { handleSubmit, isLoading } = useEntityForm<TransactionFormData>({
    api: {
      create: transactionsApi.create,
      update: (id, data) => transactionsApi.update(String(id), data),
    },
    queryKey: ['transactions'],
    entityId: transaction?.id,
    onSuccess: onClose,
  });

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={formConfig.title || ''}
      description={formConfig.description}
      size="xl"
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={transaction ? 'Update Transaction' : 'Add Transaction'}
      />
    </ModernModal>
  );
}
