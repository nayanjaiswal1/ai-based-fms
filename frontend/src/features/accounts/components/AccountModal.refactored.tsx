import { accountsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getAccountFormConfig, AccountFormData } from '../config/accountFormConfig';

interface AccountModalProps {
  account?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ account, isOpen, onClose }: AccountModalProps) {
  const formConfig = getAccountFormConfig(account);

  const { handleSubmit, isLoading } = useEntityForm<AccountFormData>({
    api: {
      create: accountsApi.create,
      update: (id, data) => accountsApi.update(String(id), data),
    },
    queryKey: ['accounts'],
    entityId: account?.id,
    onSuccess: onClose,
  });

  return (
    <Modal
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
        submitLabel={account ? 'Update Account' : 'Add Account'}
      />
    </Modal>
  );
}
