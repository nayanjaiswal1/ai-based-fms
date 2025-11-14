import { accountsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getAccountFormConfig, AccountFormData } from '../config/accountFormConfig';

interface AccountModalProps {
  account?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ account, isOpen, onClose }: AccountModalProps) {
  const formConfig = getAccountFormConfig(account);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  const { handleSubmit, isLoading } = useEntityForm<AccountFormData>({
    api: {
      create: accountsApi.create,
      update: (id, data) => accountsApi.update(String(id), data),
    },
    queryKey: ['accounts'],
    entityId: account?.id,
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
      size="lg"
      onBeforeClose={checkBeforeClose}
    >
      <ConfigurableForm
        config={formConfig}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
        submitLabel={account ? 'Update Account' : 'Add Account'}
        onDirtyChange={setIsDirty}
      />
    </ModernModal>
  );
}
