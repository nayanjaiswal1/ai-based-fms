import { accountsApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { usePreferencesStore } from '@stores/preferencesStore';
import { getAccountFormConfig, AccountFormData } from '../config/accountFormConfig';

interface AccountModalProps {
  account?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ account, isOpen, onClose }: AccountModalProps) {
  const formConfig = getAccountFormConfig(account);
  const userCurrency = usePreferencesStore((state) => state.preferences.currency);

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
    // Ensure currency is always set from user preference
    transform: (data) => ({
      ...data,
      currency: data.currency || userCurrency,
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
        submitLabel={account ? 'Update Account' : 'Add Account'}
        onDirtyChange={setIsDirty}
      />
    </Modal>
  );
}
