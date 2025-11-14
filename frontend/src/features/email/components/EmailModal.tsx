import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { getEmailFormConfig, EmailFormData } from '../config/emailFormConfig';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
  const queryClient = useQueryClient();
  const formConfig = getEmailFormConfig();

  const connectMutation = useMutation({
    mutationFn: (data: EmailFormData) =>
      emailApi.connect({
        ...data,
        password: data.authMethod === 'basic' ? data.password : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
      onClose();
    },
  });

  const handleSubmit = async (data: EmailFormData) => {
    return connectMutation.mutateAsync(data);
  };

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
        isLoading={connectMutation.isPending}
        onCancel={onClose}
        submitLabel="Connect Account"
      />
    </Modal>
  );
}
