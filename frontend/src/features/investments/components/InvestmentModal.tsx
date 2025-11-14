import { useQueryClient } from '@tanstack/react-query';
import { investmentsApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { useFormProtection } from '@hooks/useFormProtection';
import { getInvestmentFormConfig, InvestmentFormData } from '../config/investmentFormConfig';

interface InvestmentModalProps {
  investment?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvestmentModal({ investment, isOpen, onClose }: InvestmentModalProps) {
  const queryClient = useQueryClient();
  const formConfig = getInvestmentFormConfig(investment);

  // Form protection to prevent accidental data loss
  const { setIsDirty, checkBeforeClose, reset } = useFormProtection({
    confirmMessage: 'You have unsaved changes. Are you sure you want to close this form?',
  });

  const { handleSubmit, isLoading } = useEntityForm<InvestmentFormData>({
    api: {
      create: investmentsApi.create,
      update: (id, data) => investmentsApi.update(String(id), data),
    },
    queryKey: ['investments'],
    entityId: investment?.id,
    onSuccess: () => {
      // Also invalidate portfolio query
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      reset(); // Clear dirty state on successful submit
      onClose();
    },
    transform: (data) => ({
      ...data,
      symbol: data.symbol || undefined,
      quantity: data.quantity || undefined,
      notes: data.notes || undefined,
    }),
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
        submitLabel={investment ? 'Update Investment' : 'Add Investment'}
        onDirtyChange={setIsDirty}
      />
    </ModernModal>
  );
}
