import { remindersApi } from '@services/api';
import { ModernModal } from '@components/ui/ModernModal';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { useEntityForm } from '@hooks/useEntityForm';
import { getReminderFormConfig, ReminderFormData } from '../../reminders/config/reminderFormConfig';

interface ReminderModalProps {
  reminder?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReminderModal({ reminder, isOpen, onClose }: ReminderModalProps) {
  const formConfig = getReminderFormConfig(reminder);

  const { handleSubmit, isLoading } = useEntityForm<ReminderFormData>({
    api: {
      create: remindersApi.create,
      update: (id, data) => remindersApi.update(String(id), data),
    },
    queryKey: ['reminders'],
    entityId: reminder?.id,
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
        submitLabel={reminder ? 'Update Reminder' : 'Add Reminder'}
      />
    </ModernModal>
  );
}
